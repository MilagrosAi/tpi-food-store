from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacionNoPermitida,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (Admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> list[UserPublic]:
    return service.listar_usuarios()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    try:
        return service.activar_usuario(id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    try:
        assert admin.id is not None
        return service.desactivar_usuario(id, admin.id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except AutoDesactivacionNoPermitida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )