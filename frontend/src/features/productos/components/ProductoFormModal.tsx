import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import type { Categoria } from "../../categorias/types/categoria";
import {
  useActualizarProducto,
  useCrearProducto,
} from "../hooks/useProductos";
import type { Producto } from "../types/producto";

interface ProductoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoEdit: Producto | null;
  categorias: Categoria[];
}

export function ProductoFormModal({
  isOpen,
  onClose,
  productoEdit,
  categorias,
}: ProductoFormModalProps) {
  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: productoEdit?.nombre ?? "",
      descripcion: productoEdit?.descripcion ?? "",
      precio_base: productoEdit?.precio_base ?? 0,
      imagen_url: productoEdit?.imagen_url ?? "",
      stock: productoEdit?.stock ?? 0,
      disponible: productoEdit?.disponible ?? true,
      categoria_id: productoEdit?.categoria_id ?? categorias[0]?.id ?? 0,
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        const payload = {
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim(),
          precio_base: Number(value.precio_base),
          imagen_url: value.imagen_url.trim(),
          stock: Number(value.stock),
          disponible: value.disponible,
          categoria_id: Number(value.categoria_id),
        };

        if (productoEdit) {
          await actualizarMutation.mutateAsync({
            id: productoEdit.id,
            payload,
          });
        } else {
          await crearMutation.mutateAsync(payload);
        }
        onClose();
      } catch (err) {
        setApiError(handleApiError(err, "No se pudo guardar el producto"));
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productoEdit ? "Editar producto" : "Nuevo producto"}
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
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim().length === 0 ? "El nombre es obligatorio" : undefined,
          }}
        >
          {(field) => {
            const errorMsg = field.state.meta.errors
              .filter((e) => typeof e === "string")
              .join(", ");
            return (
              <Input
                id="prod-nombre"
                label="Nombre *"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={errorMsg || undefined}
              />
            );
          }}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              value <= 0 ? "Selecciona una categoría" : undefined,
          }}
        >
          {(field) => {
            const errorMsg = field.state.meta.errors
              .filter((e) => typeof e === "string")
              .join(", ");
            return (
              <div>
                <label
                  htmlFor="prod-categoria"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Categoría *
                </label>
                <select
                  id="prod-categoria"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={0}>Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errorMsg && (
                  <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
                )}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label
                htmlFor="prod-descripcion"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="prod-descripcion"
                rows={2}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) || value < 0
                  ? "Debe ser mayor o igual a 0"
                  : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="prod-precio"
                  label="Precio base ($) *"
                  type="number"
                  step="0.01"
                  min={0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={errorMsg || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) || value < 0
                  ? "Debe ser mayor o igual a 0"
                  : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="prod-stock"
                  label="Stock *"
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
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id="prod-imagen"
              label="URL de imagen"
              type="url"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://..."
            />
          )}
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
                {isSubmitting
                  ? "Guardando..."
                  : productoEdit
                    ? "Actualizar"
                    : "Crear"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}