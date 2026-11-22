import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from "../api/categorias";
import type { CategoriaCreate, CategoriaUpdate } from "../types/categoria";

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoriaCreate) => createCategoria(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaUpdate }) =>
      updateCategoria(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });
}