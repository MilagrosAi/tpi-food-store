import { useCallback, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { CategoriaFormModal } from "../components/CategoriaFormModal";
import { useCategorias, useEliminarCategoria } from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria";

export function AdminCategoriasPage() {
  const categoriasQuery = useCategorias();
  const eliminarMutation = useEliminarCategoria();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<Categoria | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCrear = () => {
    setCategoriaEdit(null);
    setModalOpen(true);
  };

  const handleEditar = useCallback((cat: Categoria) => {
    setCategoriaEdit(cat);
    setModalOpen(true);
  }, []);

  const handleEliminar = useCallback(
    async (cat: Categoria) => {
      const ok = window.confirm(
        `¿Deseas dar de baja la categoría "${cat.nombre}"?`
      );
      if (!ok) return;

      setActionError(null);
      try {
        await eliminarMutation.mutateAsync(cat.id);
      } catch (err) {
        setActionError(handleApiError(err, "No se pudo eliminar la categoría"));
      }
    },
    [eliminarMutation]
  );

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "nombre", header: "Nombre" },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({ row }) => row.original.descripcion || "—",
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEditar(row.original)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={eliminarMutation.isPending}
              onClick={() => void handleEliminar(row.original)}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [handleEditar, handleEliminar, eliminarMutation.isPending]
  );

  const table = useReactTable({
    data: categoriasQuery.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Administrar categorías
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Crea, edita o da de baja lógica las categorías del catálogo.
          </p>
        </div>
        <Button onClick={handleCrear}>Nueva categoría</Button>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {categoriasQuery.isLoading && <Skeleton variant="table" count={4} />}

      {categoriasQuery.isError && (
        <EstadoError
          mensaje={handleApiError(categoriasQuery.error)}
          onRetry={() => void categoriasQuery.refetch()}
        />
      )}

      {!categoriasQuery.isLoading &&
        !categoriasQuery.isError &&
        (categoriasQuery.data?.length ?? 0) === 0 && (
          <EstadoVacio
            titulo="Sin categorías"
            mensaje="Crea tu primera categoría para organizar el menú."
          />
        )}

      {!categoriasQuery.isLoading &&
        !categoriasQuery.isError &&
        (categoriasQuery.data?.length ?? 0) > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-600">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 font-semibold">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-slate-800">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span>
                  Página {table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

      {modalOpen && (
        <CategoriaFormModal
          key={categoriaEdit ? categoriaEdit.id : "new"}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoriaEdit={categoriaEdit}
        />
      )}
    </section>
  );
}