import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  CambioEstadoPayload,
  Pedido,
  PedidoCreate,
  PedidosFiltros,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido";

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>("/pedidos", payload);
  return data;
}

export async function getPedidos(
  filtros: PedidosFiltros = {}
): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", {
    params: filtros,
  });
  return data;
}

export async function cambiarEstadoPedido(
  id: number,
  payload: CambioEstadoPayload
): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(
    `/pedidos/${id}/estado`,
    payload
  );
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}