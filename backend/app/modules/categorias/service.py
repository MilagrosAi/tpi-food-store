from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        nombre = data.nombre.strip()
        with self.uow as uow:
            if uow.categorias.get_by_nombre(nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")

            nueva = Categoria(
                nombre=nombre,
                descripcion=data.descripcion.strip(),
                activo=True,
            )
            creada = uow.categorias.add(nueva)
            return CategoriaRead.model_validate(creada)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            if data.nombre is not None:
                nuevo_nombre = data.nombre.strip()
                if nuevo_nombre != categoria.nombre:
                    existente = uow.categorias.get_by_nombre(nuevo_nombre)
                    if existente and existente.id != categoria.id:
                        raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.nombre = nuevo_nombre

            if data.descripcion is not None:
                categoria.descripcion = data.descripcion.strip()

            uow.session.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            categoria.activo = False
            uow.session.add(categoria)
            uow.session.flush()