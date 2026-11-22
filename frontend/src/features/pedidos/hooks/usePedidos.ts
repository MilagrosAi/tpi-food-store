import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedidos,
  getResumenPedidos,
} from "../api/pedidos";
import type {
  CambioEstadoPayload,
  PedidoCreate,
  PedidosFiltros,
} from "../types/pedido";

export function usePedidos(filtros: PedidosFiltros = {}) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => getPedidos(filtros),
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
    },
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CambioEstadoPayload;
    }) => cambiarEstadoPedido(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
    },
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ["pedidos-resumen"],
    queryFn: getResumenPedidos,
  });
}