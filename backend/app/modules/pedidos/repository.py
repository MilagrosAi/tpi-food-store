from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_by_id_with_items(self, pedido_id: int) -> Optional[Pedido]:
        statement = (
            select(Pedido)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .where(Pedido.id == pedido_id)
        )
        return self.session.exec(statement).first()

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        self.session.refresh(detalle)
        return detalle

    def list_by_usuario(
        self,
        usuario_id: Optional[int] = None,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Pedido]]:
        filters = []
        if usuario_id is not None:
            filters.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filters.append(Pedido.estado == estado)

        count_stmt = select(func.count()).select_from(Pedido)
        if filters:
            count_stmt = count_stmt.where(*filters)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Pedido)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(Pedido.id.desc())  # type: ignore[union-attr]
            .offset(skip)
            .limit(limit)
        )
        if filters:
            items_stmt = items_stmt.where(*filters)

        items = list(self.session.exec(items_stmt).all())
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)  # type: ignore[arg-type]
        rows = self.session.exec(statement).all()
        conteos = {
            "PENDIENTE": 0,
            "EN_PREPARACION": 0,
            "ENTREGADO": 0,
            "CANCELADO": 0,
        }
        for estado, cantidad in rows:
            if estado in conteos:
                conteos[estado] = int(cantidad)
        return conteos

    def count_pedidos_hoy(self) -> int:
        inicio_hoy = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_hoy)
        )
        return int(self.session.exec(statement).one())

    def sum_ingresos_entregados(self) -> float:
        statement = (
            select(func.coalesce(func.sum(Pedido.total), 0.0))
            .where(Pedido.estado == "ENTREGADO")
        )
        resultado = self.session.exec(statement).one()
        return float(resultado or 0.0)