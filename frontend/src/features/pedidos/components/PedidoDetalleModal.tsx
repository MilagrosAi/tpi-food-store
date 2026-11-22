import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Modal } from "../../../shared/ui/Modal";
import type { Pedido } from "../types/pedido";

interface PedidoDetalleModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

export function PedidoDetalleModal({
  pedido,
  onClose,
}: PedidoDetalleModalProps) {
  if (!pedido) return null;

  return (
    <Modal
      isOpen={Boolean(pedido)}
      onClose={onClose}
      title={`Detalle del Pedido #${pedido.id}`}
    >
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
          <div>
            <p className="text-xs text-slate-500">Fecha de creación</p>
            <p className="font-medium text-slate-900">
              {new Date(pedido.created_at).toLocaleString("es-AR")}
            </p>
          </div>
          <BadgeEstado estado={pedido.estado} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500">Dirección de entrega</p>
            <p className="font-medium text-slate-900">
              {pedido.direccion_entrega}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Forma de pago</p>
            <p className="font-medium text-slate-900">{pedido.forma_pago}</p>
          </div>
        </div>

        {pedido.notas && (
          <div>
            <p className="text-xs text-slate-500">Notas</p>
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700">
              {pedido.notas}
            </p>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ítems del pedido (precios congelados)
          </p>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2 text-right">Cant.</th>
                  <th className="px-3 py-2 text-right">Precio</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pedido.items.map((item) => (
                  <tr key={item.producto_id}>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {item.nombre_producto}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {item.cantidad}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      ${item.precio_unitario.toLocaleString("es-AR")}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">
                      ${item.subtotal.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
          <span>Total del pedido</span>
          <span className="text-orange-600">
            ${pedido.total.toLocaleString("es-AR")}
          </span>
        </div>
      </div>
    </Modal>
  );
}