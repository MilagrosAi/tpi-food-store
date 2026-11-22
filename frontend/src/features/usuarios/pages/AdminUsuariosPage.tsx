import { useMemo, useState } from "react";
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
import { useAuthStore } from "../../../store/authStore";
import type { UserPublic } from "../../auth/types/auth";
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from "../hooks/useUsuarios";

export function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((s) => s.usuario);
  const usuariosQuery = useUsuarios();
  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();
  const [actionError, setActionError] = useState<string | null>(null);

  const isMutating = activarMutation.isPending || desactivarMutation.isPending;

  const columns = useMemo<ColumnDef<UserPublic>[]>(
    () => [
      { accessorKey: "username", header: "Usuario" },
      { accessorKey: "full_name", header: "Nombre completo" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
              row.original.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        id: "estado",
        header: "Estado",
        cell: ({ row }) =>
          row.original.disabled ? (
            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              Desactivado
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Activo
            </span>
          ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          const esSesionActual = usuarioActual?.id === u.id;

          if (u.disabled) {
            return (
              <Button
                variant="success"
                size="sm"
                disabled={isMutating}
                onClick={async () => {
                  setActionError(null);
                  try {
                    await activarMutation.mutateAsync(u.id);
                  } catch (err) {
                    setActionError(handleApiError(err));
                  }
                }}
              >
                Activar
              </Button>
            );
          }

          if (esSesionActual) {
            return (
              <span className="text-xs italic text-slate-400">
                Sesión actual
              </span>
            );
          }

          return (
            <Button
              variant="danger"
              size="sm"
              disabled={isMutating}
              onClick={async () => {
                setActionError(null);
                try {
                  await desactivarMutation.mutateAsync(u.id);
                } catch (err) {
                  setActionError(handleApiError(err));
                }
              }}
            >
              Desactivar
            </Button>
          );
        },
      },
    ],
    [usuarioActual?.id, isMutating, activarMutation, desactivarMutation]
  );

  const table = useReactTable({
    data: usuariosQuery.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Gestión de usuarios
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Activa o desactiva cuentas de clientes y administradores.
        </p>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {usuariosQuery.isLoading && <Skeleton variant="table" count={5} />}

      {usuariosQuery.isError && (
        <EstadoError
          mensaje={handleApiError(usuariosQuery.error)}
          onRetry={() => void usuariosQuery.refetch()}
        />
      )}

      {!usuariosQuery.isLoading &&
        !usuariosQuery.isError &&
        (usuariosQuery.data?.length ?? 0) === 0 && (
          <EstadoVacio mensaje="No hay usuarios registrados." />
        )}

      {!usuariosQuery.isLoading &&
        !usuariosQuery.isError &&
        (usuariosQuery.data?.length ?? 0) > 0 && (
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
    </section>
  );
}