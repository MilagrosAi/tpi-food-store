import { Button } from "../ui/Button";

interface PaginacionProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function Paginacion({
  page,
  totalItems,
  pageSize,
  onPageChange,
}: PaginacionProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <span>
        Página <strong className="text-slate-900">{page + 1}</strong> de{" "}
        <strong className="text-slate-900">{totalPages}</strong> ({totalItems}{" "}
        resultados)
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}