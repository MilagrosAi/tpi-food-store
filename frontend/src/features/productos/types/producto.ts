import type { Categoria } from "../../categorias/types/categoria";

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface ProductosFiltros {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

export interface ProductoCreate {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio_base?: number;
  imagen_url?: string;
  stock?: number;
  disponible?: boolean;
  categoria_id?: number;
}

export interface ProductoStockUpdate {
  stock: number;
  disponible: boolean;
}