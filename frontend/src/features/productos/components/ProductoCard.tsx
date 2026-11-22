import { useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { useCartStore } from "../../../store/cartStore";
import type { Producto } from "../types/producto";

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar);
  const itemEnCarrito = useCartStore((s) =>
    s.items.find((i) => i.producto_id === producto.id)
  );
  const [recienAgregado, setRecienAgregado] = useState(false);

  const sinStock = producto.stock <= 0;
  const noVendible = !producto.disponible || sinStock;
  const alcanzoMaximo =
    itemEnCarrito !== undefined && itemEnCarrito.cantidad >= producto.stock;

  const handleAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });
    setRecienAgregado(true);
    setTimeout(() => setRecienAgregado(false), 1200);
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-48 w-full bg-slate-100">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Sin imagen
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-medium text-white">
          {producto.categoria.nombre}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">
            {producto.nombre}
          </h3>
          <span className="shrink-0 text-base font-bold text-orange-600">
            ${producto.precio_base.toLocaleString("es-AR")}
          </span>
        </div>

        <p className="mt-1.5 flex-1 text-sm text-slate-600 line-clamp-2">
          {producto.descripcion || "Sin descripción"}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs">
          {noVendible ? (
            <span className="font-semibold text-red-600">
              {!producto.disponible ? "No disponible" : "Sin stock"}
            </span>
          ) : (
            <span className="font-medium text-emerald-700">
              Stock disponible: {producto.stock}
            </span>
          )}

          {itemEnCarrito && (
            <span className="font-medium text-slate-500">
              En carrito: {itemEnCarrito.cantidad}
            </span>
          )}
        </div>

        <Button
          className="mt-3 w-full"
          disabled={noVendible || alcanzoMaximo}
          onClick={handleAgregar}
        >
          {noVendible
            ? "No disponible"
            : alcanzoMaximo
              ? "Stock máximo en carrito"
              : recienAgregado
                ? "Agregado al carrito ✓"
                : "Agregar al carrito"}
        </Button>
      </div>
    </Card>
  );
}