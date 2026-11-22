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
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types/pedido";

export function AdminPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | "">("");
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const pedidosQuery = usePedidos({
    skip: 0,
    limit: 100,
    estado: estadoFiltro === "" ? undefined : estadoFiltro,
  });
  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const handleCambiarEstado = useCallback(
    async (pedidoId: number, nuevoEstado: EstadoPedido) => {
      if (nuevoEstado === "CANCELADO") {
        const ok = window.confirm(
          `¿Confirmas cancelar el pedido #${pedidoId}? Se restituirá el stock de sus productos.`
        );
        if (!ok) return;
      }

      setActionError(null);
      try {
        await cambiarEstadoMutation.mutateAsync({
          id: pedidoId,
          payload: { estado: nuevoEstado },
        });
      } catch (err) {
        setActionError(
          handleApiError(err, "No se pudo actualizar el estado del pedido")
        );
      }
    },
    [cambiarEstadoMutation]
  );

  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Pedido",
        cell: ({ row }) => (
          <span className="font-bold text-slate-900">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: "usuario_id",
        header: "Usuario ID",
      },
      {
        accessorKey: "created_at",
        header: "Fecha",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleString("es-AR"),
      },
      {
        accessorKey: "forma_pago",
        header: "Pago",
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            ${row.original.total.toLocaleString("es-AR")}
          </span>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const pedido = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPedidoDetalle(pedido)}
              >
                Detalle
              </Button>

              {pedido.estado === "PENDIENTE" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() =>
                      void handleCambiarEstado(pedido.id, "EN_PREPARACION")
                    }
                  >
                    Preparar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() =>
                      void handleCambiarEstado(pedido.id, "CANCELADO")
                    }
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {pedido.estado === "EN_PREPARACION" && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() =>
                      void handleCambiarEstado(pedido.id, "ENTREGADO")
                    }
                  >
                    Entregar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() =>
                      void handleCambiarEstado(pedido.id, "CANCELADO")
                    }
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [handleCambiarEstado, cambiarEstadoMutation.isPending]
  );

  const table = useReactTable({
    data: pedidosQuery.data?.items ?? [],
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
            Gestión de pedidos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Avanza o cancela pedidos respetando la máquina de estados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="filtro-estado-pedidos"
            className="text-sm font-medium text-slate-700"
          >
            Estado:
          </label>
          <select
            id="filtro-estado-pedidos"
            value={estadoFiltro}
            onChange={(e) =>
              setEstadoFiltro(e.target.value as EstadoPedido | "")
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En preparación</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {pedidosQuery.isLoading && <Skeleton variant="table" count={5} />}

      {pedidosQuery.isError && (
        <EstadoError
          mensaje={handleApiError(pedidosQuery.error)}
          onRetry={() => void pedidosQuery.refetch()}
        />
      )}

      {!pedidosQuery.isLoading &&
        !pedidosQuery.isError &&
        (pedidosQuery.data?.items.length ?? 0) === 0 && (
          <EstadoVacio
            titulo="No hay pedidos"
            mensaje="No se encontraron pedidos para el filtro seleccionado."
          />
        )}

      {!pedidosQuery.isLoading &&
        !pedidosQuery.isError &&
        (pedidosQuery.data?.items.length ?? 0) > 0 && (
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

      <PedidoDetalleModal
        pedido={pedidoDetalle}
        onClose={() => setPedidoDetalle(null)}
      />
    </section>
  );
}