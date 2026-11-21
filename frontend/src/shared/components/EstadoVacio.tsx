import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo?: string;
  mensaje: string;
  accion?: ReactNode;
}

export function EstadoVacio({
  titulo = "Sin resultados",
  mensaje,
  accion,
}: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
      <p className="mt-1 text-sm text-slate-500">{mensaje}</p>
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}