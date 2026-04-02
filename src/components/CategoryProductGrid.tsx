import { useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { getPrecioFinal, isDescuentoActivo } from "../data/productos";
import { adminCatalog, getVisibleProducts } from "../stores/catalogAdmin";

interface Props {
  categoriaId: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CategoryProductGrid({ categoriaId }: Props) {
  const catalogState = useStore(adminCatalog);
  const sourceProducts = useMemo(() => {
    return getVisibleProducts(catalogState.products).filter(
      (p) => p.categoria === categoriaId,
    );
  }, [catalogState.products, categoriaId]);

  const [sortBy, setSortBy] = useState<
    "relevante" | "precio_asc" | "precio_desc" | "nombre"
  >("relevante");
  const [filterBrand, setFilterBrand] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSale, setFilterSale] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const brands = [...new Set(sourceProducts.map((p) => p.marca))].sort();

  const filtered = useMemo(() => {
    let result = [...sourceProducts];
    if (filterBrand) result = result.filter((p) => p.marca === filterBrand);
    if (filterStatus === "en_stock") result = result.filter((p) => p.stock > 0);
    if (filterStatus === "preorden")
      result = result.filter((p) => p.estado === "preorden");
    if (filterSale)
      result = result.filter(
        (p) => p.descuento && isDescuentoActivo(p.descuento),
      );
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
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
  }, [sourceProducts, filterBrand, filterStatus, filterSale, sortBy, searchQ]);

  const hasFilters = filterBrand || filterStatus || filterSale || searchQ;

  return (
    <div className="flex gap-6">
      {/* Sidebar filters — desktop only */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="bg-white rounded-2xl border border-ui-100 p-5 space-y-5 sticky top-24">
          <div>
            <h3 className="font-heading text-sm uppercase text-neutral-dark tracking-wide mb-3">
              Buscar
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Buscar en esta categoría..."
                className="w-full border border-ui-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange pr-7"
              />
              {searchQ && (
                <button
                  onClick={() => setSearchQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-400"
                >
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
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm uppercase text-neutral-dark tracking-wide mb-3">
              Marca
            </h3>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="brand"
                  checked={filterBrand === ""}
                  onChange={() => setFilterBrand("")}
                  className="accent-brand-orange"
                />
                <span className="text-sm text-neutral-dark group-hover:text-brand-orange transition-colors">
                  Todas ({sourceProducts.length})
                </span>
              </label>
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={filterBrand === brand}
                    onChange={() => setFilterBrand(brand)}
                    className="accent-brand-orange"
                  />
                  <span className="text-sm text-neutral-dark group-hover:text-brand-orange transition-colors">
                    {brand} (
                    {sourceProducts.filter((p) => p.marca === brand).length})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm uppercase text-neutral-dark tracking-wide mb-3">
              Disponibilidad
            </h3>
            <div className="space-y-1.5">
              {[
                { value: "", label: "Todos" },
                { value: "en_stock", label: "En stock" },
                { value: "preorden", label: "Preorden" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="status"
                    checked={filterStatus === opt.value}
                    onChange={() => setFilterStatus(opt.value)}
                    className="accent-brand-orange"
                  />
                  <span className="text-sm text-neutral-dark group-hover:text-brand-orange transition-colors">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterSale}
                onChange={(e) => setFilterSale(e.target.checked)}
                className="accent-brand-orange"
              />
              <span className="text-sm text-neutral-dark">
                Solo en oferta
                <span className="ml-1 bg-brand-yellow text-neutral-dark text-xs font-bold px-1.5 py-0.5 rounded-full">
                  %
                </span>
              </span>
            </label>
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setFilterBrand("");
                setFilterStatus("");
                setFilterSale(false);
                setSearchQ("");
              }}
              className="w-full text-xs text-brand-orange underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>

      {/* Product grid */}
      <div className="flex-1 min-w-0">
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 bg-white border border-ui-100 rounded-xl px-4 py-2 text-sm font-semibold text-neutral-dark shadow-sm"
            >
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              Filtros
              {hasFilters && (
                <span className="bg-brand-orange text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>
            {filterBrand && (
              <span className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold px-3 py-1.5 rounded-full">
                {filterBrand}
                <button
                  onClick={() => setFilterBrand("")}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )}
            {filterStatus && (
              <span className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold px-3 py-1.5 rounded-full">
                {filterStatus === "en_stock" ? "En stock" : "Preorden"}
                <button
                  onClick={() => setFilterStatus("")}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )}
            {filterSale && (
              <span className="flex items-center gap-1 bg-brand-yellow/20 text-neutral-dark text-xs font-semibold px-3 py-1.5 rounded-full">
                En oferta
                <button
                  onClick={() => setFilterSale(false)}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 bg-white rounded-2xl border border-ui-100 p-4 space-y-4">
                  {/* Search */}
                  <div>
                    <label className="text-xs font-bold text-neutral-dark uppercase tracking-wide block mb-1.5">
                      Buscar
                    </label>
                    <input
                      type="text"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      placeholder="Buscar en esta categoría..."
                      className="w-full border border-ui-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="text-xs font-bold text-neutral-dark uppercase tracking-wide block mb-1.5">
                      Marca
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterBrand("")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          filterBrand === ""
                            ? "bg-brand-orange text-white border-brand-orange"
                            : "border-ui-100 text-neutral-dark"
                        }`}
                      >
                        Todas
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setFilterBrand(brand)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            filterBrand === brand
                              ? "bg-brand-orange text-white border-brand-orange"
                              : "border-ui-100 text-neutral-dark"
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-bold text-neutral-dark uppercase tracking-wide block mb-1.5">
                      Disponibilidad
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "", label: "Todos" },
                        { value: "en_stock", label: "En stock" },
                        { value: "preorden", label: "Preorden" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFilterStatus(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            filterStatus === opt.value
                              ? "bg-brand-orange text-white border-brand-orange"
                              : "border-ui-100 text-neutral-dark"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sale toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterSale}
                      onChange={(e) => setFilterSale(e.target.checked)}
                      className="accent-brand-orange"
                    />
                    <span className="text-sm text-neutral-dark font-medium">
                      Solo en oferta
                      <span className="ml-1 bg-brand-yellow text-neutral-dark text-xs font-bold px-1.5 py-0.5 rounded-full">
                        %
                      </span>
                    </span>
                  </label>

                  {hasFilters && (
                    <button
                      onClick={() => {
                        setFilterBrand("");
                        setFilterStatus("");
                        setFilterSale(false);
                        setSearchQ("");
                      }}
                      className="w-full text-xs text-brand-orange underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="text-sm text-ui-400">
            <span className="font-semibold text-neutral-dark">
              {filtered.length}
            </span>{" "}
            productos
            {hasFilters && " (filtrado)"}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-ui-400">Ordenar:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-ui-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
            >
              <option value="relevante">Más relevante</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-ui-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-ui-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="font-heading text-lg text-neutral-dark">
              Sin resultados
            </p>
            <p className="text-ui-400 text-sm mt-1">
              Intenta con otros filtros
            </p>
          </div>
        ) : (
          <motion.div
            key={`${filterBrand}-${filterStatus}-${filterSale}-${sortBy}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filtered.map((p) => (
                <motion.div key={p.id} variants={itemVariants} layout>
                  <ProductCard producto={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
