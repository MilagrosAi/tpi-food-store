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
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoFormModal } from "../components/ProductoFormModal";
import { ProductoStockModal } from "../components/ProductoStockModal";
import { useEliminarProducto, useProductos } from "../hooks/useProductos";
import type { Producto } from "../types/producto";

export function AdminProductosPage() {
  const productosQuery = useProductos({ skip: 0, limit: 100 });
  const categoriasQuery = useCategorias();
  const eliminarMutation = useEliminarProducto();

  const [formOpen, setFormOpen] = useState(false);
  const [productoEdit, setProductoEdit] = useState<Producto | null>(null);
  const [productoStock, setProductoStock] = useState<Producto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCrear = () => {
    setProductoEdit(null);
    setFormOpen(true);
  };

  const handleEditar = useCallback((prod: Producto) => {
    setProductoEdit(prod);
    setFormOpen(true);
  }, []);

  const handleEliminar = useCallback(
    async (prod: Producto) => {
      const ok = window.confirm(
        `¿Deseas dar de baja el producto "${prod.nombre}"?`
      );
      if (!ok) return;

      setActionError(null);
      try {
        await eliminarMutation.mutateAsync(prod.id);
      } catch (err) {
        setActionError(handleApiError(err, "No se pudo eliminar el producto"));
      }
    },
    [eliminarMutation]
  );

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "nombre", header: "Producto" },
      {
        id: "categoria",
        header: "Categoría",
        cell: ({ row }) => row.original.categoria.nombre,
      },
      {
        accessorKey: "precio_base",
        header: "Precio",
        cell: ({ row }) =>
          `$${row.original.precio_base.toLocaleString("es-AR")}`,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <span
            className={`font-semibold ${
              row.original.stock === 0 ? "text-red-600" : "text-slate-900"
            }`}
          >
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: "disponible",
        header: "Disponible",
        cell: ({ row }) =>
          row.original.disponible ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Sí
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              No
            </span>
          ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setProductoStock(row.original)}
            >
              Stock
            </Button>
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
    data: productosQuery.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Administrar productos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona el catálogo, precios, stock y disponibilidad.
          </p>
        </div>
        <Button onClick={handleCrear}>Nuevo producto</Button>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {productosQuery.isLoading && <Skeleton variant="table" count={6} />}

      {productosQuery.isError && (
        <EstadoError
          mensaje={handleApiError(productosQuery.error)}
          onRetry={() => void productosQuery.refetch()}
        />
      )}

      {!productosQuery.isLoading &&
        !productosQuery.isError &&
        (productosQuery.data?.items.length ?? 0) === 0 && (
          <EstadoVacio
            titulo="Sin productos"
            mensaje="Crea tu primer producto para empezar a vender."
          />
        )}

      {!productosQuery.isLoading &&
        !productosQuery.isError &&
        (productosQuery.data?.items.length ?? 0) > 0 && (
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

      {formOpen && (
        <ProductoFormModal
          key={productoEdit ? productoEdit.id : "new"}
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          productoEdit={productoEdit}
          categorias={categoriasQuery.data ?? []}
        />
      )}

      {productoStock && (
        <ProductoStockModal
          key={productoStock.id}
          producto={productoStock}
          onClose={() => setProductoStock(null)}
        />
      )}
    </section>
  );
}