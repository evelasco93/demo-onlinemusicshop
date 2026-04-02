import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Producto } from "../data/productos";
import { adminCatalog, getVisibleProducts } from "../stores/catalogAdmin";

interface Props {
  title: string;
  subtitle?: string;
  productos: Producto[];
  showViewAll?: boolean;
  viewAllHref?: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeaturedProducts({
  title,
  subtitle,
  productos,
  showViewAll,
  viewAllHref,
}: Props) {
  const catalogState = useStore(adminCatalog);
  const displayedProducts = useMemo(() => {
    const visible = getVisibleProducts(catalogState.products);
    const byId = new Map(visible.map((p) => [p.id, p]));
    return productos
      .map((p) => byId.get(p.id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [catalogState.products, productos]);

  if (displayedProducts.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="font-heading text-4xl text-neutral-dark uppercase">
              {title}
            </h2>
            {subtitle && <p className="text-ui-400 mt-1">{subtitle}</p>}
          </div>
          {showViewAll && viewAllHref && (
            <a
              href={viewAllHref}
              className="hidden sm:flex items-center gap-1 text-brand-orange font-semibold text-sm hover:gap-2 transition-all"
            >
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
            </a>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {displayedProducts.map((p) => (
            <motion.div key={p.id} variants={itemVariants}>
              <ProductCard producto={p} />
            </motion.div>
          ))}
        </motion.div>

        {showViewAll && viewAllHref && (
          <div className="sm:hidden mt-6 text-center">
            <a
              href={viewAllHref}
              className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-2.5 rounded-full font-semibold text-sm"
            >
              Ver todos los productos
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
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
