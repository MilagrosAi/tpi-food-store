from datetime import datetime, timezone
from typing import Optional
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear_pedido(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            # RN-01: Ningún producto repetido entre los ítems
            producto_ids = [item.producto_id for item in data.items]
            if len(producto_ids) != len(set(producto_ids)):
                raise ProductoRepetido(
                    "No se puede repetir el mismo producto en un pedido"
                )

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega.strip(),
                    notas=data.notas.strip() if data.notas else None,
                    total=0.0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' "
                        f"(disponible: {producto.stock}, solicitado: {item.cantidad})"
                    )

                # Descuento de stock y copia inmutable de nombre y precio (RN-01, RN-05)
                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total = round(total + subtotal, 2)

            pedido.total = total
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()

            pedido_completo = uow.pedidos.get_by_id_with_items(pedido.id)
            assert pedido_completo is not None
            return PedidoRead.model_validate(pedido_completo)

    def listar_pedidos(
        self,
        usuario_id: int,
        role: str,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            # RN-04: admin ve todos; user solo los propios
            filtro_usuario = None if role == "admin" else usuario_id
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario,
                estado=estado,
                skip=skip,
                limit=limit,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener_por_id(
        self, pedido_id: int, usuario_id: int, role: str
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            if role != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tiene permiso para acceder a este pedido")

            return PedidoRead.model_validate(pedido)

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: Restituye el stock de cada línea en la misma transacción
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)
            if producto:
                producto.stock += detalle.cantidad
                uow.session.add(producto)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # RN-02: Validar transición contra el mapa de estados
            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if data.estado not in permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar un pedido de {pedido.estado} a {data.estado}"
                )

            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            pedido_actualizado = uow.pedidos.get_by_id_with_items(pedido_id)
            assert pedido_actualizado is not None
            return PedidoRead.model_validate(pedido_actualizado)

    def cancelar_por_dueno(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # RN-04: Solo el dueño puede cancelar desde este endpoint
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tiene permiso para cancelar este pedido")

            # RN-04: El cliente solo cancela si está en PENDIENTE
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos en estado PENDIENTE"
                )

            self._restituir_stock(uow, pedido)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            pedido_actualizado = uow.pedidos.get_by_id_with_items(pedido_id)
            assert pedido_actualizado is not None
            return PedidoRead.model_validate(pedido_actualizado)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            pedidos_hoy = uow.pedidos.count_pedidos_hoy()
            ingresos_entregados = round(uow.pedidos.sum_ingresos_entregados(), 2)
            return ResumenPedidos(
                pendientes=conteos["PENDIENTE"],
                en_preparacion=conteos["EN_PREPARACION"],
                entregados=conteos["ENTREGADO"],
                cancelados=conteos["CANCELADO"],
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=ingresos_entregados,
            )