import { useState } from "react";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { handleApiError } from "../../../shared/api/handleApiError";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const PAGE_SIZE = 6;

export function CatalogoPage() {
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);

  const categoriasQuery = useCategorias();
  const productosQuery = useProductos({
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    search: search.trim() ? search.trim() : undefined,
    categoria_id: categoriaId,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleCategoriaChange = (value: string) => {
    setCategoriaId(value ? Number(value) : undefined);
    setPage(0);
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Catálogo de comidas
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Explora nuestros platos, arma tu carrito y realiza tu pedido online.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="md:col-span-2">
          <label
            htmlFor="busqueda-productos"
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1"
          >
            Buscar por nombre
          </label>
          <input
            id="busqueda-productos"
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Ej: Hamburguesa, Pizza, Limonada..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="filtro-categoria"
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1"
          >
            Filtrar por categoría
          </label>
          <select
            id="filtro-categoria"
            value={categoriaId ?? ""}
            onChange={(e) => handleCategoriaChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todas las categorías</option>
            {(categoriasQuery.data ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {productosQuery.isLoading && <Skeleton variant="cards" count={6} />}

      {productosQuery.isError && (
        <EstadoError
          mensaje={handleApiError(productosQuery.error)}
          onRetry={() => void productosQuery.refetch()}
        />
      )}

      {!productosQuery.isLoading &&
        !productosQuery.isError &&
        productosQuery.data &&
        productosQuery.data.items.length === 0 && (
          <EstadoVacio
            titulo="No se encontraron productos"
            mensaje="Prueba cambiando el texto de búsqueda o seleccionando otra categoría."
          />
        )}

      {!productosQuery.isLoading &&
        !productosQuery.isError &&
        productosQuery.data &&
        productosQuery.data.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productosQuery.data.items.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>

            <Paginacion
              page={page}
              totalItems={productosQuery.data.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
    </section>
  );
}