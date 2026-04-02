import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllProductos } from "../data/productos";

export default function SearchModal() {
  // This component is a global search modal triggered by keyboard shortcut
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = (() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return getAllProductos()
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q),
      )
      .slice(0, 8);
  })();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-ui-100">
              <svg
                className="w-5 h-5 text-ui-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                className="flex-1 text-neutral-dark text-lg focus:outline-none placeholder-ui-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-ui-400 hover:text-neutral-dark"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-1 text-xs text-ui-400 bg-ui-50 border border-ui-100 rounded px-2 py-1 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.length < 2 ? (
                <div className="px-5 py-6 text-center text-ui-400 text-sm">
                  <p>Escribe al menos 2 caracteres para buscar</p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {["Guitarra", "Tagima", "Valeton", "Amplificador"].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="bg-ui-50 hover:bg-brand-orange hover:text-white text-neutral-dark text-xs px-3 py-1.5 rounded-full transition-colors border border-ui-100"
                        >
                          {tag}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="px-5 py-6 text-center text-ui-400 text-sm">
                  No se encontraron resultados para "<strong>{query}</strong>"
                </div>
              ) : (
                <div>
                  {results.map((p) => (
                    <a
                      key={p.id}
                      href={`/producto/${p.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-ui-50 transition-colors border-b border-ui-100 last:border-0 group"
                    >
                      <img
                        src={
                          p.imagenes[0] ||
                          `https://placehold.co/56x56/2E144F/FFFFFF?text=${encodeURIComponent(p.marca)}`
                        }
                        alt={p.nombre}
                        className="w-14 h-14 object-contain rounded-lg bg-ui-50 border border-ui-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://placehold.co/56x56/2E144F/FFFFFF?text=${encodeURIComponent(p.marca)}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-dark group-hover:text-brand-orange transition-colors truncate">
                          {p.nombre}
                        </p>
                        <p className="text-xs text-ui-400 mt-0.5">
                          {p.marca} ·{" "}
                          {p.categoria.charAt(0).toUpperCase() +
                            p.categoria.slice(1)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-brand-orange">
                          ${p.precio.toLocaleString("es-SV")}
                        </p>
                        {p.estado === "en_stock" ? (
                          <span className="text-xs text-green-600">
                            En stock
                          </span>
                        ) : (
                          <span className="text-xs text-ui-400">Preorden</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="px-5 py-3 bg-ui-50 border-t border-ui-100 flex items-center justify-between text-xs text-ui-400">
                <span>{results.length} resultado(s) encontrado(s)</span>
                <a
                  href={`/categorias?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="text-brand-orange font-semibold hover:underline"
                >
                  Ver todos →
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
