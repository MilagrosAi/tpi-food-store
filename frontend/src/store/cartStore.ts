import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string;
  stock: number;
}

export interface AddToCartInput {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  imagen_url: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  agregar: (producto: AddToCartInput, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        if (cantidad < 1 || producto.stock < 1) return;

        set((state) => {
          const existente = state.items.find(
            (item) => item.producto_id === producto.producto_id
          );

          if (existente) {
            const nuevaCantidad = Math.min(
              existente.cantidad + cantidad,
              producto.stock
            );
            return {
              items: state.items.map((item) =>
                item.producto_id === producto.producto_id
                  ? {
                      ...item,
                      nombre: producto.nombre,
                      precio_unitario: producto.precio_unitario,
                      imagen_url: producto.imagen_url,
                      stock: producto.stock,
                      cantidad: nuevaCantidad,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...producto,
                cantidad: Math.min(cantidad, producto.stock),
              },
            ],
          };
        });
      },

      quitar: (productoId) => {
        set((state) => ({
          items: state.items.filter((item) => item.producto_id !== productoId),
        }));
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad < 1) {
          get().quitar(productoId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.producto_id === productoId
              ? {
                  ...item,
                  cantidad: Math.min(cantidad, Math.max(item.stock, 1)),
                }
              : item
          ),
        }));
      },

      vaciar: () => set({ items: [] }),

      total: () => {
        const suma = get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        );
        return Math.round(suma * 100) / 100;
      },
    }),
    {
      name: "foodstore-cart",
    }
  )
);