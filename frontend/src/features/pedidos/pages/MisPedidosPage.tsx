import { useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types/pedido";

const PAGE_SIZE = 10;

export function MisPedidosPage() {
  const [page, setPage] = useState(0);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const pedidosQuery = usePedidos({
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });
  const cancelarMutation = useCancelarPedido();

  const handleCancelar = async (pedidoId: number) => {
    const confirmado = window.confirm(
      `¿Deseas cancelar el pedido #${pedidoId}? El stock será restituido automáticamente.`
    );
    if (!confirmado) return;

    setActionError(null);
    try {
      await cancelarMutation.mutateAsync(pedidoId);
    } catch (err) {
      setActionError(handleApiError(err, "No se pudo cancelar el pedido"));
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Mis pedidos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Consulta el estado de tus pedidos y cancela los que todavía estén
          pendientes.
        </p>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {pedidosQuery.isLoading && <Skeleton variant="table" count={4} />}

      {pedidosQuery.isError && (
        <EstadoError
          mensaje={handleApiError(pedidosQuery.error)}
          onRetry={() => void pedidosQuery.refetch()}
        />
      )}

      {!pedidosQuery.isLoading &&
        !pedidosQuery.isError &&
        pedidosQuery.data &&
        pedidosQuery.data.items.length === 0 && (
          <EstadoVacio
            titulo="Todavía no realizaste pedidos"
            mensaje="Explora nuestro catálogo para hacer tu primer pedido."
            accion={
              <Link
                to="/"
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition"
              >
                Ir al catálogo
              </Link>
            }
          />
        )}

      {!pedidosQuery.isLoading &&
        !pedidosQuery.isError &&
        pedidosQuery.data &&
        pedidosQuery.data.items.length > 0 && (
          <>
            <div className="space-y-4">
              {pedidosQuery.data.items.map((pedido) => (
                <Card
                  key={pedido.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-bold text-slate-900">
                        Pedido #{pedido.id}
                      </span>
                      <BadgeEstado estado={pedido.estado} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(pedido.created_at).toLocaleString("es-AR")} ·{" "}
                      {pedido.forma_pago}
                    </p>
                    <p className="text-sm text-slate-700">
                      Entrega: {pedido.direccion_entrega}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-orange-600 mr-2">
                      ${pedido.total.toLocaleString("es-AR")}
                    </span>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      Ver detalle
                    </Button>

                    {pedido.estado === "PENDIENTE" && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={cancelarMutation.isPending}
                        onClick={() => void handleCancelar(pedido.id)}
                      >
                        Cancelar pedido
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Paginacion
              page={page}
              totalItems={pedidosQuery.data.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}

      <PedidoDetalleModal
        pedido={pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
      />
    </section>
  );
}