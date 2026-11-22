import { Link } from "react-router-dom";
import { Card } from "../../../shared/ui/Card";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-12">
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600">
          403
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sin permiso</h1>
        <p className="mt-2 text-sm text-slate-600">
          No cuentas con los permisos necesarios para acceder a esta sección.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition"
        >
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}