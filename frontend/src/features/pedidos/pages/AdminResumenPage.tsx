import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Card } from "../../../shared/ui/Card";
import { useResumenPedidos } from "../hooks/usePedidos";

export function AdminResumenPage() {
  const resumenQuery = useResumenPedidos();

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Resumen del negocio
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Indicadores generales de pedidos e ingresos entregados.
          </p>
        </div>

        <Link
          to="/admin/pedidos"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition"
        >
          Ver todos los pedidos
        </Link>
      </div>

      {resumenQuery.isLoading && <Skeleton variant="stats" count={6} />}

      {resumenQuery.isError && (
        <EstadoError
          mensaje={handleApiError(resumenQuery.error)}
          onRetry={() => void resumenQuery.refetch()}
        />
      )}

      {resumenQuery.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card className="p-6 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pendientes
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {resumenQuery.data.pendientes}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              En preparación
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {resumenQuery.data.en_preparacion}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-emerald-500">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Entregados
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {resumenQuery.data.entregados}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cancelados
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {resumenQuery.data.cancelados}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pedidos hoy
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {resumenQuery.data.pedidos_hoy}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ingresos entregados
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              ${resumenQuery.data.ingresos_entregados.toLocaleString("es-AR")}
            </p>
          </Card>
        </div>
      )}
    </section>
  );
}