import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@nanostores/react";
import { addToCart, cartOpen } from "../stores/cart";
import { stockMap } from "../stores/stock";
import type { Producto, ColorVariante } from "../data/productos";
import { getPrecioFinal, isDescuentoActivo } from "../data/productos";

const BRAND_LOGOS: Record<string, string> = {
  Tagima: "/brands/tagima.png",
  Schecter: "/brands/schecter.png",
  Valeton: "/brands/valeton.png",
  Sonicake: "/brands/sonicake.png",
  Nux: "/brands/nux.png",
  Hotone: "/brands/hotone.png",
};

interface Props {
  producto: Producto;
}

export default function ProductDetail({ producto }: Props) {
  const stock = useStore(stockMap);
  const [selectedVariant, setSelectedVariant] = useState<ColorVariante | null>(
    producto.variantes ? producto.variantes[0] : null,
  );

  const currentStock =
    selectedVariant != null
      ? selectedVariant.stock
      : (stock[producto.id] ?? producto.stock);
  const precioFinal = getPrecioFinal(producto);
  const hasDiscount =
    producto.descuento && isDescuentoActivo(producto.descuento);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"descripcion" | "specs">(
    "descripcion",
  );
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const baseImages =
    producto.imagenes.length > 0
      ? producto.imagenes
      : [
          `https://placehold.co/600x500/2E144F/FFFFFF?text=${encodeURIComponent(producto.nombre)}`,
        ];

  const images = selectedVariant?.imagenes?.length
    ? selectedVariant.imagenes
    : baseImages;

  const isAvailable =
    selectedVariant != null
      ? selectedVariant.estado === "en_stock" && selectedVariant.stock > 0
      : currentStock > 0;

  const handleAddToCart = () => {
    if (!isAvailable && producto.estado !== "preorden") return;
    const variantSuffix = selectedVariant ? ` — ${selectedVariant.nombre}` : "";
    addToCart({
      id:
        producto.id +
        (selectedVariant
          ? `-${selectedVariant.nombre.toLowerCase().replace(/\//g, "-")}`
          : ""),
      nombre: producto.nombre + variantSuffix,
      precio: producto.precio,
      precioFinal,
      cantidad: quantity,
      imagen: images[0],
      categoria: producto.categoria,
      marca: producto.marca,
    });
    cartOpen.set(true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-ui-400 mb-8">
        <a href="/" className="hover:text-brand-orange transition-colors">
          Inicio
        </a>
        <span>/</span>
        <a
          href="/categorias"
          className="hover:text-brand-orange transition-colors"
        >
          Catálogo
        </a>
        <span>/</span>
        <a
          href={`/categorias/${producto.categoria}`}
          className="hover:text-brand-orange transition-colors capitalize"
        >
          {producto.categoria}
        </a>
        <span>/</span>
        <span className="text-neutral-dark font-medium truncate max-w-[200px]">
          {producto.nombre}
        </span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl overflow-hidden border border-ui-100 aspect-square flex items-center justify-center p-6 relative"
          >
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-brand-yellow text-neutral-dark font-bold text-sm px-3 py-1 rounded-full z-10">
                -{producto.descuento!.porcentaje}% OFF
              </span>
            )}
            {produto_estado_badge(producto, currentStock)}
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                src={images[selectedImage]}
                alt={producto.nombre}
                className="max-h-96 w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://placehold.co/500x500/2E144F/FFFFFF?text=${encodeURIComponent(producto.nombre)}`;
                }}
              />
            </AnimatePresence>
            {/* Image nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage(
                      (selectedImage - 1 + images.length) % images.length,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border border-ui-100 rounded-full flex items-center justify-center shadow transition-all"
                >
                  <svg
                    className="w-4 h-4 text-neutral-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setSelectedImage((selectedImage + 1) % images.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border border-ui-100 rounded-full flex items-center justify-center shadow transition-all"
                >
                  <svg
                    className="w-4 h-4 text-neutral-dark"
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
                </button>
              </>
            )}
          </motion.div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden bg-ui-50 flex items-center justify-center p-1 transition-all ${
                    selectedImage === i
                      ? "border-brand-orange"
                      : "border-ui-100 hover:border-ui-400"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Brand & category */}
          <div className="flex items-center gap-2 mb-2">
            {BRAND_LOGOS[producto.marca] ? (
              <a
                href={`/categorias?marca=${encodeURIComponent(producto.marca)}`}
              >
                <img
                  src={BRAND_LOGOS[producto.marca]}
                  alt={producto.marca}
                  className="h-8 w-auto object-contain"
                />
              </a>
            ) : (
              <span className="text-xs font-bold text-white bg-brand-purple px-2.5 py-1 rounded-full uppercase tracking-wide">
                {producto.marca}
              </span>
            )}
            <span className="text-xs text-ui-400 capitalize bg-ui-100 px-2 py-0.5 rounded-full">
              {producto.categoria}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl text-neutral-dark uppercase leading-tight">
            {producto.nombre}
          </h1>

          {/* Rating mock */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-brand-yellow">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`w-4 h-4 ${s <= 4 ? "fill-current" : "fill-ui-100"}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-ui-400">4.0 (12 reseñas)</span>
          </div>

          {/* Price */}
          <div className="mt-6 p-4 bg-ui-50 rounded-xl border border-ui-100">
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-4xl text-brand-orange font-bold">
                $
                {precioFinal.toLocaleString("es-SV", {
                  minimumFractionDigits: 2,
                })}
              </span>
              {hasDiscount && (
                <span className="text-ui-400 text-xl line-through">
                  $
                  {producto.precio.toLocaleString("es-SV", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-green-600 font-bold text-sm">
                  Ahorras ${(producto.precio - precioFinal).toFixed(2)}
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {producto.descuento!.porcentaje}% OFF
                </span>
              </div>
            )}
            <p className="text-xs text-ui-400 mt-1">Precio incluye IVA</p>
          </div>

          {/* Stock status */}
          <div className="mt-4">
            {isAvailable ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-700 font-semibold">
                    {currentStock > 5
                      ? "En stock"
                      : `¡Solo ${currentStock} disponibles!`}
                  </span>
                </div>
              </div>
            ) : producto.estado === "preorden" ? (
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5 inline-flex">
                <span className="w-2 h-2 bg-brand-purple rounded-full" />
                <span className="text-sm text-brand-purple font-semibold">
                  Preorden — Disponible {producto.fecha_estimada}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-ui-50 border border-ui-100 rounded-full px-3 py-1.5 inline-flex">
                <span className="text-sm text-ui-400">Producto agotado</span>
              </div>
            )}
          </div>

          {/* Loyalty points earn */}
          <div className="mt-3 flex items-center gap-2 text-xs text-brand-purple bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
            <svg
              className="w-4 h-4 text-brand-yellow"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Gana <strong>{Math.floor(precioFinal)} puntos</strong> de lealtad
            con esta compra
          </div>

          {/* Color variant picker */}
          {producto.variantes && producto.variantes.length > 0 && (
            <div className="mt-4 p-4 bg-ui-50 rounded-xl border border-ui-100">
              <p className="text-xs font-semibold text-neutral-dark mb-2.5">
                Color:{" "}
                <span className="text-brand-orange font-bold">
                  {selectedVariant?.nombre}
                </span>
              </p>
              <div className="flex gap-3 flex-wrap">
                {producto.variantes.map((v) => (
                  <button
                    key={v.nombre}
                    onClick={() => {
                      setSelectedVariant(v);
                      setSelectedImage(0);
                    }}
                    disabled={v.estado === "agotado"}
                    title={
                      v.estado === "agotado"
                        ? `${v.nombre} — Agotado`
                        : v.nombre
                    }
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedVariant?.nombre === v.nombre
                        ? "border-brand-orange bg-white shadow"
                        : v.estado === "agotado"
                          ? "border-ui-100 bg-ui-50 opacity-45 cursor-not-allowed"
                          : "border-ui-100 hover:border-brand-orange bg-white"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-ui-100 shrink-0"
                      style={{
                        backgroundColor: v.colorCode,
                        boxShadow:
                          v.colorCode === "#FFFFFF"
                            ? "inset 0 0 0 1px #e5e7eb"
                            : undefined,
                      }}
                    />
                    <span className="text-neutral-dark">{v.nombre}</span>
                    {v.estado === "agotado" && (
                      <span className="text-red-400 text-xs font-normal ml-1">
                        Agotado
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          {(isAvailable || producto.estado === "preorden") && (
            <div className="mt-6 flex items-center gap-4">
              <label className="text-sm font-semibold text-neutral-dark">
                Cantidad:
              </label>
              <div className="flex items-center bg-ui-50 border border-ui-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-neutral-dark">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentStock || 99, quantity + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <motion.button
              onClick={handleAddToCart}
              whileTap={
                isAvailable || producto.estado === "preorden"
                  ? { scale: 0.97 }
                  : {}
              }
              disabled={!isAvailable && producto.estado !== "preorden"}
              className={`flex-1 py-4 rounded-xl font-heading font-semibold uppercase tracking-wide text-lg transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white"
                  : isAvailable
                    ? "bg-brand-orange hover:bg-brand-orange-dark text-white hover:shadow-lg hover:shadow-brand-orange/30"
                    : producto.estado === "preorden"
                      ? "bg-brand-purple hover:bg-brand-purple-light text-white"
                      : "bg-ui-100 text-ui-400 cursor-not-allowed"
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  ¡Agregado al carrito!
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

          {/* Shipping info */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <svg
                className="w-5 h-5 text-green-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span>
                {precioFinal >= 25 ? (
                  <>
                    <strong>Envío gratis</strong> incluido
                  </>
                ) : (
                  <>
                    Agrega <strong>${(25 - precioFinal).toFixed(2)}</strong> más
                    para envío gratis
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <svg
                className="w-5 h-5 text-brand-orange shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Garantía de 1 año del fabricante</span>
            </div>
            {/* Store pickup option */}
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">
                  Recoger en tienda — Gratis
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  Lista en <strong>2 horas</strong> · Hillside Mall, C. La
                  Mascota, San Salvador
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Lun–Vie 9:30–5:30 · Sáb 9:30–4:00 · Tel: 2525-3357
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs: description + specs */}
      <div className="mt-14">
        <div className="flex gap-1 border-b border-ui-100 mb-6">
          {[
            { key: "descripcion", label: "Descripción" },
            { key: "specs", label: "Especificaciones" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-6 py-3 font-heading text-sm uppercase tracking-wide border-b-2 transition-all -mb-px ${
                activeTab === tab.key
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-ui-400 hover:text-neutral-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "descripcion" ? (
            <motion.div
              key="descripcion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="prose max-w-none"
            >
              <p className="text-neutral-dark leading-relaxed text-base">
                {producto.descripcion}
              </p>
              {producto.lista_espera && (
                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-brand-purple font-semibold text-sm">
                    📋 Este producto está en preorden. Fecha estimada de
                    disponibilidad: <strong>{producto.fecha_estimada}</strong>
                  </p>
                  <p className="text-brand-purple/70 text-sm mt-1">
                    Al hacer preorden, recibirás una confirmación por correo con
                    todos los detalles.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(producto.detalles).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex gap-3 p-3 bg-ui-50 rounded-xl border border-ui-100"
                  >
                    <span className="text-sm font-semibold text-neutral-dark min-w-[120px] shrink-0">
                      {key}
                    </span>
                    <span className="text-sm text-ui-400">{String(value)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function produto_estado_badge(producto: Producto, stock: number) {
  if (stock === 0 && producto.estado !== "preorden") {
    return (
      <span className="absolute top-4 right-4 bg-neutral-dark text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
        AGOTADO
      </span>
    );
  }
  if (producto.estado === "preorden") {
    return (
      <span className="absolute top-4 right-4 bg-brand-purple text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
        PREORDEN
      </span>
    );
  }
  return null;
}
