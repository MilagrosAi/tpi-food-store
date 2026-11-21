from typing import Optional
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(data.categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("La categoría no existe o está inactiva")

            nuevo = Producto(
                categoria_id=data.categoria_id,
                nombre=data.nombre.strip(),
                descripcion=data.descripcion.strip(),
                precio_base=data.precio_base,
                imagen_url=data.imagen_url.strip(),
                stock=data.stock,
                disponible=data.disponible,
                activo=True,
            )
            creado = uow.productos.add(nuevo)
            creado.categoria = categoria
            return ProductoRead.model_validate(creado)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            if data.categoria_id is not None:
                nueva_categoria = uow.categorias.get_activa_by_id(data.categoria_id)
                if not nueva_categoria:
                    raise CategoriaNoEncontrada(
                        "La categoría no existe o está inactiva"
                    )
                producto.categoria_id = data.categoria_id
                producto.categoria = nueva_categoria

            if data.nombre is not None:
                producto.nombre = data.nombre.strip()
            if data.descripcion is not None:
                producto.descripcion = data.descripcion.strip()
            if data.precio_base is not None:
                producto.precio_base = data.precio_base
            if data.imagen_url is not None:
                producto.imagen_url = data.imagen_url.strip()
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible

            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.activo = False
            uow.session.add(producto)
            uow.session.flush()