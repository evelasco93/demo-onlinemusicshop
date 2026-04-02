import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { addToCart, cartOpen } from "../stores/cart";
import { stockMap } from "../stores/stock";
import type { Producto } from "../data/productos";
import { getPrecioFinal, isDescuentoActivo } from "../data/productos";

interface Props {
  producto: Producto;
  compact?: boolean;
}

export default function ProductCard({ producto, compact = false }: Props) {
  const stock = useStore(stockMap);
  const currentStock = stock[producto.id] ?? producto.stock;
  const precioFinal = getPrecioFinal(producto);
  const hasDiscount =
    producto.descuento && isDescuentoActivo(producto.descuento);
  const [added, setAdded] = useState(false);
  const imagen =
    producto.imagenes[0] ||
    `https://placehold.co/400x400/2E144F/FFFFFF?text=${encodeURIComponent(producto.nombre)}`;
  const isAvailable = currentStock > 0 && producto.estado !== "agotado";
  const hasDetailPage = !producto.sessionOnly;
  const detailHref = hasDetailPage ? `/producto/${producto.id}` : "#";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      precioFinal,
      cantidad: 1,
      imagen,
      categoria: producto.categoria,
      marca: producto.marca,
    });
    cartOpen.set(true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="product-card group bg-white rounded-2xl border border-ui-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-orange/20 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image */}
      <a
        href={detailHref}
        onClick={(e) => {
          if (!hasDetailPage) e.preventDefault();
        }}
        className="relative block overflow-hidden"
      >
        <div className="h-52 bg-white flex items-center justify-center p-3">
          <img
            src={imagen}
            alt={producto.nombre}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-400"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/400x400/2E144F/FFFFFF?text=${encodeURIComponent(producto.nombre)}`;
            }}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-brand-yellow text-neutral-dark text-xs font-bold px-2 py-0.5 rounded-full">
              -{producto.descuento!.porcentaje}% OFF
            </span>
          )}
          {producto.estado === "preorden" && (
            <span className="bg-brand-purple text-white text-xs font-bold px-2 py-0.5 rounded-full">
              PREORDEN
            </span>
          )}
          {currentStock <= 3 && currentStock > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              ¡Últimas {currentStock}!
            </span>
          )}
          {currentStock === 0 && producto.estado !== "preorden" && (
            <span className="bg-neutral-dark text-white text-xs font-bold px-2 py-0.5 rounded-full">
              AGOTADO
            </span>
          )}
        </div>

        {/* Quick view on hover */}
        <div className="absolute inset-0 bg-brand-purple/0 group-hover:bg-brand-purple/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          {hasDetailPage ? (
            <span className="bg-white text-brand-purple text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
              Ver detalles →
            </span>
          ) : (
            <span className="bg-white/80 text-ui-400 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
              Sin página de detalle
            </span>
          )}
        </div>
      </a>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs text-ui-400 font-semibold uppercase tracking-wide">
            {producto.marca}
          </p>
          <h3
            className={`font-semibold text-neutral-dark text-sm mt-0.5 leading-tight line-clamp-2 ${
              hasDetailPage ? "hover:text-brand-orange transition-colors" : ""
            }`}
          >
            {hasDetailPage ? (
              <a href={`/producto/${producto.id}`}>{producto.nombre}</a>
            ) : (
              producto.nombre
            )}
          </h3>
          {!compact && (
            <p className="text-xs text-ui-400 mt-1 line-clamp-2">
              {producto.descripcion}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 min-h-[52px]">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl text-brand-orange">
              $
              {precioFinal.toLocaleString("es-SV", {
                minimumFractionDigits: 2,
              })}
            </span>
            {hasDiscount && (
              <span className="text-ui-400 text-sm line-through">
                $
                {producto.precio.toLocaleString("es-SV", {
                  minimumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-green-600 text-xs font-semibold mt-0.5">
              Ahorras ${(producto.precio - precioFinal).toFixed(2)}
            </p>
          )}
        </div>

        {/* Stock indicator */}
        <div className="mt-2 mb-3">
          {isAvailable ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-green-600 font-medium">
                {currentStock > 5
                  ? "En stock"
                  : `Solo ${currentStock} disponibles`}
              </span>
            </div>
          ) : producto.estado === "preorden" ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-brand-purple rounded-full" />
              <span className="text-xs text-brand-purple font-medium">
                Disponible {producto.fecha_estimada}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-neutral-dark rounded-full" />
              <span className="text-xs text-ui-400 font-medium">Agotado</span>
            </div>
          )}
        </div>

        {/* Add to cart button */}
        <motion.button
          onClick={handleAddToCart}
          whileTap={isAvailable ? { scale: 0.97 } : {}}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            added
              ? "bg-green-500 text-white"
              : isAvailable
                ? "bg-brand-orange hover:bg-brand-orange-dark text-white hover:shadow-md"
                : producto.estado === "preorden"
                  ? "bg-brand-purple text-white cursor-pointer"
                  : "bg-ui-100 text-ui-400 cursor-not-allowed"
          }`}
          disabled={!isAvailable && producto.estado !== "preorden"}
        >
          {added ? (
            <span className="flex items-center justify-center gap-1.5">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              ¡Agregado!
            </span>
          ) : isAvailable ? (
            "Agregar al Carrito"
          ) : producto.estado === "preorden" ? (
            "Pre-ordenar"
          ) : (
            "No disponible"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
