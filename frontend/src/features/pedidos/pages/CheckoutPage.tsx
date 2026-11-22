import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { useCartStore } from "../../../store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types/pedido";

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedidoMutation = useCrearPedido();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        await crearPedidoMutation.mutateAsync({
          items: items.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() ? value.notas.trim() : null,
        });
        vaciar();
        navigate("/mis-pedidos", { replace: true });
      } catch (err) {
        setApiError(handleApiError(err, "No se pudo confirmar el pedido"));
      }
    },
  });

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Confirmar pedido
        </h1>
        <EstadoVacio
          titulo="No hay productos en el carrito"
          mensaje="Agrega al menos un producto antes de realizar el checkout."
          accion={
            <Link
              to="/"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition"
            >
              Volver al catálogo
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">
        Confirmar pedido
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">
            Datos de entrega y pago
          </h2>

          {apiError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="mt-5 space-y-4"
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const len = value.trim().length;
                  if (len < 5) {
                    return "La dirección debe tener al menos 5 caracteres";
                  }
                  if (len > 200) {
                    return "La dirección no puede superar los 200 caracteres";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const errorMsg = field.state.meta.errors
                  .filter((e) => typeof e === "string")
                  .join(", ");
                return (
                  <Input
                    id="checkout-direccion"
                    label="Dirección de entrega *"
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Av. Colón 1250, Piso 3, Depto B"
                    error={errorMsg || undefined}
                  />
                );
              }}
            </form.Field>

            <form.Field name="forma_pago">
              {(field) => (
                <div>
                  <label
                    htmlFor="checkout-pago"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Forma de pago *
                  </label>
                  <select
                    id="checkout-pago"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as FormaPago)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="EFECTIVO">Efectivo al entregar</option>
                    <option value="TRANSFERENCIA">
                      Transferencia bancaria
                    </option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div>
                  <label
                    htmlFor="checkout-notas"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="checkout-notas"
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Sin cebolla, tocar timbre 2B..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || crearPedidoMutation.isPending}
                >
                  {isSubmitting || crearPedidoMutation.isPending
                    ? "Confirmando pedido..."
                    : "Finalizar pedido"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </Card>

        <Card className="p-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900">Tu pedido</h2>
          <ul className="mt-4 divide-y divide-slate-200 text-sm">
            {items.map((item) => (
              <li
                key={item.producto_id}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-slate-700">
                  {item.cantidad}× {item.nombre}
                </span>
                <span className="font-semibold text-slate-900">
                  $
                  {(item.precio_unitario * item.cantidad).toLocaleString(
                    "es-AR"
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-orange-600">
              ${total.toLocaleString("es-AR")}
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}