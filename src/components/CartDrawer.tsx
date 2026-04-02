import { useStore } from "@nanostores/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  cartItems,
  cartOpen,
  removeFromCart,
  updateQuantity,
  getCartTotal,
} from "../stores/cart";

export default function CartDrawer() {
  const items = useStore(cartItems);
  const isOpen = useStore(cartOpen);
  const total = items.reduce((s, i) => s + i.precioFinal * i.cantidad, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => cartOpen.set(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-[101] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-ui-100"
              style={{ backgroundColor: "#2E144F" }}
            >
              <h2 className="text-white font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Mi Carrito
                {items.length > 0 && (
                  <span className="bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {items.reduce((s, i) => s + i.cantidad, 0)}
                  </span>
                )}
              </h2>
              <button
                onClick={() => cartOpen.set(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Cerrar carrito"
              >
                <svg
                  className="w-6 h-6"
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
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-ui-50 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-ui-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-heading text-lg text-neutral-dark">
                      Tu carrito está vacío
                    </p>
                    <p className="text-ui-400 text-sm mt-1">
                      Explora nuestros productos y agrega algo increíble
                    </p>
                  </div>
                  <button
                    onClick={() => cartOpen.set(false)}
                    className="bg-brand-orange text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-brand-orange-dark transition-colors"
                  >
                    Explorar Tienda
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="flex gap-3 bg-ui-50 rounded-xl p-3"
                      >
                        <img
                          src={
                            item.imagen ||
                            `https://placehold.co/64x64/2E144F/FFFFFF?text=${encodeURIComponent(item.marca)}`
                          }
                          alt={item.nombre}
                          className="w-16 h-16 object-contain rounded-lg bg-white border border-ui-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://placehold.co/64x64/2E144F/FFFFFF?text=${encodeURIComponent(item.marca)}`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ui-400 font-medium">
                            {item.marca}
                          </p>
                          <p className="text-sm font-semibold text-neutral-dark leading-tight line-clamp-2">
                            {item.nombre}
                          </p>
                          {item.nota && (
                            <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                              <span>🎁</span> {item.nota}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1 bg-white border border-ui-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.cantidad - 1)
                                }
                                className="w-7 h-7 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-colors font-bold"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-neutral-dark">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.cantidad + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-colors font-bold"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold text-brand-orange text-sm">
                              $
                              {(
                                item.precioFinal * item.cantidad
                              ).toLocaleString("es-SV", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="shrink-0 text-ui-400 hover:text-red-500 transition-colors p-1"
                          aria-label={`Eliminar ${item.nombre}`}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer with total & checkout */}
            {items.length > 0 && (
              <div className="border-t border-ui-100 px-6 py-4 space-y-3">
                {/* Free shipping notice */}
                {total < 25 && (
                  <div className="bg-brand-yellow/20 border border-brand-yellow/50 rounded-lg px-3 py-2 text-xs text-neutral-dark">
                    <span className="font-semibold">
                      ¡Agrega ${(25 - total).toFixed(2)} más
                    </span>{" "}
                    para envío gratis 🎸
                    <div className="mt-1.5 w-full bg-white rounded-full h-1.5">
                      <div
                        className="bg-brand-orange h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (total / 25) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {total >= 25 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-semibold flex items-center gap-1">
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
                    ¡Envío gratis aplicado!
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-neutral-dark font-semibold">
                    Subtotal
                  </span>
                  <span className="font-bold text-xl text-brand-orange">
                    $
                    {total.toLocaleString("es-SV", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <a
                  href="/checkout"
                  onClick={() => cartOpen.set(false)}
                  className="block w-full bg-brand-orange hover:bg-brand-orange-dark text-white text-center py-3 rounded-xl font-heading font-semibold uppercase tracking-wide transition-colors"
                >
                  Ir a pagar →
                </a>
                <button
                  onClick={() => cartOpen.set(false)}
                  className="block w-full text-center text-sm text-ui-400 hover:text-neutral-dark transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
