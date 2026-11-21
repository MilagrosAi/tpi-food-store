import { Button } from "../ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onRetry?: () => void;
}

export function EstadoError({ mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <p className="font-semibold">No se pudieron cargar los datos</p>
      <p className="mt-1 text-sm">{mensaje}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}