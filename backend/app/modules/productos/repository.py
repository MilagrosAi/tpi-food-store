from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_activo_by_id(self, id: int) -> Optional[Producto]:
        statement = (
            select(Producto)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .where(
                Producto.id == id,
                Producto.activo == True,  # noqa: E712
            )
        )
        return self.session.exec(statement).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, list[Producto]]:
        base_filters = [Producto.activo == True]  # noqa: E712

        if search and search.strip():
            term = f"%{search.strip()}%"
            base_filters.append(col(Producto.nombre).ilike(term))

        if categoria_id is not None:
            base_filters.append(Producto.categoria_id == categoria_id)

        if disponible is not None:
            base_filters.append(Producto.disponible == disponible)

        count_stmt = select(func.count()).select_from(Producto).where(*base_filters)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Producto)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .where(*base_filters)
            .order_by(Producto.id)  # type: ignore[arg-type]
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items