import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { useAuthStore } from "../../../store/authStore";
import { registerUser } from "../api/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        await registerUser({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate("/login", { replace: true });
      } catch (err) {
        setApiError(handleApiError(err, "No se pudo completar el registro"));
      }
    },
  });

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Regístrate como cliente para realizar y seguir tus pedidos.
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
                  ? "El usuario debe tener al menos 2 caracteres"
                  : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="reg-username"
                  label="Nombre de usuario"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: milagrosprogramacion"
                  error={errorMsg || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? "Ingresa tu nombre completo"
                  : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="reg-fullname"
                  label="Nombre completo"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Milagros Programación"
                  error={errorMsg || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ? "Ingresa un correo electrónico válido"
                  : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="reg-email"
                  label="Correo electrónico"
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="milagros@ejemplo.com"
                  error={errorMsg || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8
                  ? "La contraseña debe tener al menos 8 caracteres"
                  : undefined,
            }}
          >
            {(field) => {
              const errorMsg = field.state.meta.errors
                .filter((e) => typeof e === "string")
                .join(", ");
              return (
                <Input
                  id="reg-password"
                  label="Contraseña (mínimo 8 caracteres)"
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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
                {isSubmitting ? "Registrando..." : "Crear cuenta"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="font-semibold text-orange-600 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}