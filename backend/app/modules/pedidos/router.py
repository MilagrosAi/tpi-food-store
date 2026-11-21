from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    data: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        assert current_user.id is not None
        return service.crear_pedido(current_user.id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: Optional[EstadoPedido] = Query(default=None),
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidosPaginados:
    assert current_user.id is not None
    return service.listar_pedidos(
        usuario_id=current_user.id,
        role=current_user.role,
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get("/resumen", response_model=ResumenPedidos)
def obtener_resumen(
    service: PedidoService = Depends(get_pedido_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ResumenPedidos:
    return service.obtener_resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        assert current_user.id is not None
        return service.obtener_por_id(id, current_user.id, current_user.role)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> PedidoRead:
    try:
        return service.cambiar_estado(id, data)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        assert current_user.id is not None
        return service.cancelar_por_dueno(id, current_user.id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )