import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { useAuthStore } from "../../../store/authStore";
import { useCartStore } from "../../../store/cartStore";

export function CarritoPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Mi carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          mensaje="Agrega productos desde el catálogo para armar tu pedido."
          accion={
            <Link
              to="/"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition"
            >
              Ir al catálogo
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Mi carrito</h1>
        <Button variant="secondary" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card
              key={item.producto_id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="h-16 w-16 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-slate-100 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-slate-900">{item.nombre}</h3>
                  <p className="text-sm text-slate-500">
                    ${item.precio_unitario.toLocaleString("es-AR")} c/u
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex items-center rounded-lg border border-slate-300">
                  <button
                    type="button"
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                    className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold text-slate-900">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    disabled={item.cantidad >= item.stock}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                    className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <span className="w-24 text-right font-bold text-slate-900">
                  $
                  {(item.precio_unitario * item.cantidad).toLocaleString(
                    "es-AR"
                  )}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => quitar(item.producto_id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Quitar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900">Resumen</h2>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-orange-600">
              ${total.toLocaleString("es-AR")}
            </span>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={() => navigate("/checkout")}
          >
            {usuario ? "Confirmar pedido" : "Iniciar sesión para comprar"}
          </Button>
        </Card>
      </div>
    </section>
  );
}