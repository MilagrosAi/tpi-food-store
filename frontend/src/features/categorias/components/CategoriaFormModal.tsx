import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import {
  useActualizarCategoria,
  useCrearCategoria,
} from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria";

interface CategoriaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaEdit: Categoria | null;
}

export function CategoriaFormModal({
  isOpen,
  onClose,
  categoriaEdit,
}: CategoriaFormModalProps) {
  const crearMutation = useCrearCategoria();
  const actualizarMutation = useActualizarCategoria();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: categoriaEdit?.nombre ?? "",
      descripcion: categoriaEdit?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        if (categoriaEdit) {
          await actualizarMutation.mutateAsync({
            id: categoriaEdit.id,
            payload: {
              nombre: value.nombre.trim(),
              descripcion: value.descripcion.trim(),
            },
          });
        } else {
          await crearMutation.mutateAsync({
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim(),
          });
        }
        onClose();
      } catch (err) {
        setApiError(handleApiError(err, "No se pudo guardar la categoría"));
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoriaEdit ? "Editar categoría" : "Nueva categoría"}
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
            onChange: ({ value }) => {
              const len = value.trim().length;
              if (len < 2) return "Mínimo 2 caracteres";
              if (len > 100) return "Máximo 100 caracteres";
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
                id="cat-nombre"
                label="Nombre *"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ej: Pastas"
                error={errorMsg || undefined}
              />
            );
          }}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label
                htmlFor="cat-descripcion"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="cat-descripcion"
                rows={3}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Descripción de la categoría..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
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
                  : categoriaEdit
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