import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import ProductCard from "./ProductCard";
import { getPrecioFinal } from "../data/productos";
import { adminCatalog, getVisibleProducts } from "../stores/catalogAdmin";

interface CategorySummary {
  id: string;
  nombre: string;
  descripcion: string;
  items: {
    id: string;
    nombre: string;
    marca: string;
    precio: number;
    imagen: string;
  }[];
}

interface Props {
  categories?: CategorySummary[];
}

export default function AllProductsCatalog({ categories = [] }: Props) {
  const [filterBrand, setFilterBrand] = useState("");
  const [showList, setShowList] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [hasMount, setHasMount] = useState(false);
  const catalogState = useStore(adminCatalog);
  const [sortBy, setSortBy] = useState<
    "relevante" | "precio_asc" | "precio_desc" | "nombre"
  >("relevante");
  const allProducts = useMemo(
    () => getVisibleProducts(catalogState.products),
    [catalogState.products],
  );

  const categoryCards = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        items: allProducts
          .filter((p) => p.categoria === cat.id)
          .map((p) => ({
            id: p.id,
            nombre: p.nombre,
            marca: p.marca,
            precio: p.precio,
            imagen: p.imagenes[0] || "",
          })),
      })),
    [categories, allProducts],
  );

  // Read initial brand/todos from URL — wait until mounted to avoid SSR mismatch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const marca = params.get("marca");
    const todos = params.get("todos");
    const q = params.get("q");
    if (marca) {
      setFilterBrand(marca);
      setShowList(true);
    } else if (todos === "1") {
      setShowList(true);
    } else if (q) {
      setSearchText(q);
      setShowList(true);
    }
    setHasMount(true);
  }, []);

  const brands = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.marca))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [allProducts]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (filterBrand) result = result.filter((p) => p.marca === filterBrand);
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q),
      );
    }
    if (sortBy === "precio_asc")
      result.sort((a, b) => getPrecioFinal(a) - getPrecioFinal(b));
    if (sortBy === "precio_desc")
      result.sort((a, b) => getPrecioFinal(b) - getPrecioFinal(a));
    if (sortBy === "nombre")
      result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return result;
  }, [allProducts, filterBrand, searchText, sortBy]);

  // Default view: category cards grid (no brand selected and showList not triggered)
  if (hasMount && !filterBrand && !showList) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          {categoryCards.map((cat) => (
            <a
              key={cat.id}
              href={`/categorias/${cat.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-ui-100 hover:-translate-y-1 hover:border-brand-orange/30 transition-all duration-300"
            >
              <div className="h-2 bg-brand-orange" />
              <div className="p-6 flex flex-col h-[calc(100%-8px)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-2xl text-neutral-dark uppercase group-hover:text-brand-orange transition-colors">
                      {cat.nombre}
                    </h2>
                    <p className="text-ui-400 text-sm mt-0.5">
                      {cat.descripcion}
                    </p>
                  </div>
                  <span className="bg-brand-orange text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                    {cat.items.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-brand-orange text-sm font-semibold group-hover:gap-2 transition-all mt-auto pt-4">
                  Ver todos
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}

          {/* Ver todos los productos card */}
          <button
            onClick={() => setShowList(true)}
            className="group bg-brand-purple rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-brand-purple hover:-translate-y-1 transition-all duration-300 text-left"
          >
            <div className="h-2 bg-brand-yellow" />
            <div className="p-6 flex flex-col h-[calc(100%-8px)] justify-between">
              <div>
                <h2 className="font-heading text-2xl text-white uppercase group-hover:text-brand-yellow transition-colors">
                  Ver Todos
                </h2>
                <p className="text-white/60 text-sm mt-0.5">
                  Explorar catálogo completo
                </p>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="bg-brand-orange text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {allProducts.length}
                </span>
                <div className="flex items-center gap-1 text-brand-yellow text-sm font-semibold group-hover:gap-2 transition-all">
                  Ver todos
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>
        <div className="text-center py-8 border-t border-ui-100">
          <p className="text-ui-400 text-sm">¿No sabes qué buscar?</p>
          <p className="font-heading text-xl text-neutral-dark mt-1 uppercase">
            Escríbenos y te ayudamos
          </p>
          <a
            href="mailto:info@onlinemusicshop.sv"
            className="mt-3 inline-flex items-center gap-2 bg-brand-purple text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-purple-light transition-colors"
          >
            Contactar asesor
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>
        </div>
      </>
    );
  }

  // Brand-filtered view
  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="hidden md:block w-52 shrink-0">
        <div className="bg-white rounded-2xl border border-ui-100 p-5 space-y-5 sticky top-24">
          <h3 className="font-heading text-sm uppercase text-neutral-dark tracking-wide">
            Marca
          </h3>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                setFilterBrand("");
                setShowList(true);
              }}
              className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${
                filterBrand === ""
                  ? "bg-brand-orange text-white font-bold"
                  : "text-neutral-dark hover:bg-ui-50"
              }`}
            >
              Todas las marcas
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setFilterBrand(b);
                  setShowList(true);
                }}
                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${
                  filterBrand === b
                    ? "bg-brand-orange text-white font-bold"
                    : "text-neutral-dark hover:bg-ui-50"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Product grid */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {filterBrand && (
              <button
                onClick={() => setFilterBrand("")}
                className="inline-flex items-center gap-1.5 bg-brand-orange/10 text-brand-orange border border-brand-orange/30 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-brand-orange hover:text-white transition-colors"
              >
                {filterBrand}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="inline-flex items-center gap-1.5 bg-brand-purple/10 text-brand-purple border border-brand-purple/30 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-brand-purple hover:text-white transition-colors"
              >
                &ldquo;{searchText}&rdquo;
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <span className="text-xs text-ui-400">
              {filtered.length} productos
            </span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-ui-100 rounded-xl px-3 py-2 text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-brand-orange"
          >
            <option value="relevante">Relevancia</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>

        {/* Mobile brand chips */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-3 mb-4">
          {["", ...brands].map((b) => (
            <button
              key={b || "todas"}
              onClick={() => {
                setFilterBrand(b);
                setShowList(true);
              }}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterBrand === b
                  ? "bg-brand-orange text-white border-brand-orange font-bold"
                  : "border-ui-100 text-neutral-dark hover:border-brand-orange"
              }`}
            >
              {b || "Todas"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-ui-400">
            <p className="font-heading text-xl uppercase">Sin resultados</p>
            <p className="text-sm mt-1">
              No hay productos para la selección actual
            </p>
            <button
              onClick={() => {
                setFilterBrand("");
                setSearchText("");
              }}
              className="mt-3 text-brand-orange text-sm font-semibold"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
