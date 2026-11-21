from typing import Optional
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def get_all_activas(self) -> list[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.activo == True)  # noqa: E712
            .order_by(Categoria.id)  # type: ignore[arg-type]
        )
        return list(self.session.exec(statement).all())

    def get_activa_by_id(self, id: int) -> Optional[Categoria]:
        statement = select(Categoria).where(
            Categoria.id == id,
            Categoria.activo == True,  # noqa: E712
        )
        return self.session.exec(statement).first()