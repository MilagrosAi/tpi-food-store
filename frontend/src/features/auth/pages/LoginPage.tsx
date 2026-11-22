import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { useAuthStore } from "../../../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        const loggedUser = await login({
          username: value.username.trim(),
          password: value.password,
        });
        navigate(loggedUser.role === "admin" ? "/admin/resumen" : "/", {
          replace: true,
        });
      } catch (err) {
        setApiError(handleApiError(err, "No se pudo iniciar sesión"));
      }
    },
  });

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ingresa tu usuario y contraseña para continuar.
        </p>

        {apiError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="mt-5 space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? "Ingresa tu nombre de usuario"
                  : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="login-username"
                  label="Usuario"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: admin"
                  error={errorMsg || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length === 0 ? "Ingresa tu contraseña" : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="login-password"
                  label="Contraseña"
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••••"
                  error={errorMsg || undefined}
                />
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          ¿Todavía no tienes cuenta?{" "}
          <Link
            to="/register"
            className="font-semibold text-orange-600 hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}