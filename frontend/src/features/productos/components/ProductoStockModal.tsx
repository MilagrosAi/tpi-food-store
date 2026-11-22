import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import { useActualizarStockProducto } from "../hooks/useProductos";
import type { Producto } from "../types/producto";

interface ProductoStockModalProps {
  producto: Producto;
  onClose: () => void;
}

export function ProductoStockModal({
  producto,
  onClose,
}: ProductoStockModalProps) {
  const stockMutation = useActualizarStockProducto();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      stock: producto.stock,
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        await stockMutation.mutateAsync({
          id: producto.id,
          payload: {
            stock: Number(value.stock),
            disponible: value.disponible,
          },
        });
        onClose();
      } catch (err) {
        setApiError(handleApiError(err, "No se pudo actualizar el stock"));
      }
    },
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Stock y disponibilidad — ${producto.nombre}`}
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value) || value < 0
                ? "El stock no puede ser negativo"
                : undefined,
          }}
        >
          {(field) => {
            const errorMsg = field.state.meta.errors
              .filter((e) => typeof e === "string")
              .join(", ");
            return (
              <Input
                id="stock-cantidad"
                label="Stock actual *"
                type="number"
                min={0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                error={errorMsg || undefined}
              />
            );
          }}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Guardar cambios"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}