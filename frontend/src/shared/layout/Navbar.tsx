import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { Button } from "../ui/Button";

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);

  const cantidadCarrito = cartItems.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const isAdmin = usuario?.role === "admin";

  const linkClass = (path: string) =>
    `text-sm font-medium transition ${
      pathname === path
        ? "text-orange-400 underline underline-offset-4"
        : "text-slate-200 hover:text-white"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
            Food Store
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            <Link to="/" className={linkClass("/")}>
              Catálogo
            </Link>

            <Link
              to="/carrito"
              className={`${linkClass("/carrito")} inline-flex items-center gap-1.5`}
            >
              <span>Carrito</span>
              {cantidadCarrito > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
                  {cantidadCarrito}
                </span>
              )}
            </Link>

            {usuario && (
              <Link to="/mis-pedidos" className={linkClass("/mis-pedidos")}>
                Mis pedidos
              </Link>
            )}

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-3 border-l border-slate-700 pl-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Admin:
                </span>
                <Link
                  to="/admin/resumen"
                  className={linkClass("/admin/resumen")}
                >
                  Resumen
                </Link>
                <Link
                  to="/admin/categorias"
                  className={linkClass("/admin/categorias")}
                >
                  Categorías
                </Link>
                <Link
                  to="/admin/productos"
                  className={linkClass("/admin/productos")}
                >
                  Productos
                </Link>
                <Link
                  to="/admin/pedidos"
                  className={linkClass("/admin/pedidos")}
                >
                  Pedidos
                </Link>
                <Link
                  to="/admin/usuarios"
                  className={linkClass("/admin/usuarios")}
                >
                  Usuarios
                </Link>
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-semibold text-white">{usuario.full_name}</p>
                <span className="inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-orange-300">
                  {usuario.role === "admin" ? "ADMINISTRADOR" : "CLIENTE"}
                </span>
              </div>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 transition"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}