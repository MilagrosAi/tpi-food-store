import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  Producto,
  ProductoCreate,
  ProductosFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto";

export async function getProductos(
  filtros: ProductosFiltros = {}
): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>("/productos", {
    params: filtros,
  });
  return data;
}

export async function createProducto(
  payload: ProductoCreate
): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>("/productos", payload);
  return data;
}

export async function updateProducto(
  id: number,
  payload: ProductoUpdate
): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(
    `/productos/${id}`,
    payload
  );
  return data;
}

export async function updateProductoStock(
  id: number,
  payload: ProductoStockUpdate
): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(
    `/productos/${id}/stock`,
    payload
  );
  return data;
}

export async function deleteProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}