import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@nanostores/react";
import { user, logout, redeemPuntos, addRecompensaCanje } from "../stores/user";
import { addToCart, cartOpen } from "../stores/cart";
import { CATALOGO_LEALTAD } from "../data/productos";

export default function AccountDashboard() {
  const currentUser = useStore(user);
  const [activeTab, setActiveTab] = useState<
    "perfil" | "historial" | "lealtad"
  >("lealtad");
  const [canjeError, setCanjeError] = useState("");
  const [canjeSuccess, setCanjeSuccess] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (!currentUser.isLoggedIn) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-ui-50 rounded-full flex items-center justify-center mx-auto mb-4">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="font-heading text-2xl text-neutral-dark uppercase">
          Acceso Requerido
        </h2>
        <p className="text-ui-400 mt-2 text-sm">
          Inicia sesión para ver tu cuenta y puntos de lealtad
        </p>
        <a
          href="/login"
          className="mt-6 inline-block bg-brand-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>
    );
  }

  const handleCanje = (item: (typeof CATALOGO_LEALTAD)[0]) => {
    setCanjeError("");
    setCanjeSuccess("");
    if (currentUser.puntos < item.puntos) {
      setCanjeError(
        `Necesitas ${item.puntos - currentUser.puntos} puntos más para canjear "${item.nombre}"`,
      );
      return;
    }
    const ok = redeemPuntos(item.puntos);
    if (ok) {
      addRecompensaCanje(item.id);
      // Auto-add product rewards to cart
      if (item.tipo === "producto") {
        addToCart({
          id: `recompensa-${item.id}`,
          nombre: `🎁 ${item.nombre} (Recompensa)`,
          precio: 0,
          precioFinal: 0,
          cantidad: 1,
          imagen: item.imagen,
          categoria: "recompensa",
          marca: "GHS",
          nota: `Canjeado con ${item.puntos} puntos de lealtad`,
        });
        cartOpen.set(true);
      }
      setCanjeSuccess(
        item.tipo === "cupon"
          ? `¡Canjeado! Tu código es: ${(item as any).codigo}. Úsalo en el checkout.`
          : item.tipo === "envio"
            ? "¡Canjeado! Tu envío gratis fue aplicado a tu próxima compra."
            : `¡Canjeado! Tu ${item.nombre} será enviado junto con tu próxima compra.`,
      );
    }
  };

  const puntosNivel =
    currentUser.puntos < 200
      ? "Bronce"
      : currentUser.puntos < 500
        ? "Plata"
        : "Oro";
  const siguienteNivel =
    currentUser.puntos < 200 ? 200 : currentUser.puntos < 500 ? 500 : null;
  const progress = siguienteNivel
    ? Math.min(100, (currentUser.puntos / siguienteNivel) * 100)
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header */}
      <div
        className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2E144F 0%, #1a0c30 100%)",
        }}
      >
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 bg-brand-orange blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-heading font-bold text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #F77021, #FFD12A)",
              }}
            >
              {currentUser.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-heading text-2xl uppercase">
                {currentUser.nombre}
              </h1>
              <p className="text-white/60 text-sm">{currentUser.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 bg-brand-yellow text-neutral-dark text-xs font-bold px-2.5 py-1 rounded-full">
                {puntosNivel === "Oro"
                  ? "🥇"
                  : puntosNivel === "Plata"
                    ? "🥈"
                    : "🥉"}{" "}
                Nivel {puntosNivel}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-white/40 hover:text-white text-xs transition-colors flex items-center gap-1"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Salir
          </button>
        </div>

        {/* Points display */}
        <div className="relative mt-5 bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide">
                Puntos disponibles
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <svg
                  className="w-5 h-5 text-brand-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-heading text-4xl text-white font-bold">
                  {currentUser.puntos}
                </span>
                <span className="text-white/50 text-sm">pts</span>
              </div>
            </div>
            {siguienteNivel && (
              <div className="text-right">
                <p className="text-white/40 text-xs">Siguiente nivel</p>
                <p className="text-white text-sm font-semibold">
                  {siguienteNivel} pts
                </p>
              </div>
            )}
          </div>
          {siguienteNivel && (
            <>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-brand-yellow h-2 rounded-full"
                />
              </div>
              <p className="text-white/40 text-xs mt-1">
                {siguienteNivel - currentUser.puntos} puntos para el siguiente
                nivel
              </p>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-ui-50 border border-ui-100 rounded-xl p-1 mb-6">
        {[
          { key: "lealtad", label: "🎁 Canjear Puntos" },
          { key: "historial", label: "📦 Mis Pedidos" },
          { key: "perfil", label: "👤 Mi Perfil" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key as typeof activeTab);
              setCanjeError("");
              setCanjeSuccess("");
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === t.key
                ? "bg-white shadow-sm text-brand-orange"
                : "text-ui-400 hover:text-neutral-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Loyalty catalog */}
        {activeTab === "lealtad" && (
          <motion.div
            key="lealtad"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl text-neutral-dark uppercase">
                Catálogo de Recompensas
              </h2>
              <span className="bg-brand-orange text-white text-sm font-bold px-3 py-1 rounded-full">
                {currentUser.puntos} pts disponibles
              </span>
            </div>

            <AnimatePresence>
              {canjeError && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600"
                >
                  {canjeError}
                </motion.div>
              )}
              {canjeSuccess && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700 font-semibold"
                >
                  ✅ {canjeSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATALOGO_LEALTAD.map((item, i) => {
                const canAfford = currentUser.puntos >= item.puntos;
                const canjeado = currentUser.recompensasCanjeadas.includes(
                  item.id,
                );
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-white rounded-2xl border overflow-hidden ${
                      canjeado
                        ? "border-green-300"
                        : canAfford
                          ? "border-brand-orange/30 shadow-md"
                          : "border-ui-100"
                    }`}
                  >
                    {/* Image */}
                    <div
                      className={`h-40 flex items-center justify-center p-4 ${!canAfford && !canjeado ? "opacity-50" : ""}`}
                      style={{ backgroundColor: "#F4F4F5" }}
                    >
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://placehold.co/200x160/2E144F/FFFFFF?text=${encodeURIComponent(item.nombre)}`;
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {item.tipo === "cupon"
                              ? "🎫"
                              : item.tipo === "envio"
                                ? "🚚"
                                : "🎸"}
                          </div>
                          <p className="text-xs text-ui-400">
                            {item.descripcion}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-dark text-sm">
                        {item.nombre}
                      </h3>
                      <p className="text-xs text-ui-400 mt-0.5 line-clamp-2">
                        {item.descripcion}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-brand-yellow"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-bold text-brand-orange text-sm">
                            {item.puntos} pts
                          </span>
                        </div>

                        <motion.button
                          whileTap={
                            canAfford && !canjeado ? { scale: 0.95 } : {}
                          }
                          onClick={() => !canjeado && handleCanje(item)}
                          disabled={canjeado}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            canjeado
                              ? "bg-green-100 text-green-600 cursor-default"
                              : canAfford
                                ? "bg-brand-orange text-white hover:bg-brand-orange-dark"
                                : "bg-ui-100 text-ui-400 cursor-not-allowed"
                          }`}
                        >
                          {canjeado
                            ? "✓ Canjeado"
                            : canAfford
                              ? "Canjear"
                              : `Faltan ${item.puntos - currentUser.puntos}`}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* How to earn points */}
            <div className="mt-8 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-5">
              <h3 className="font-heading text-lg text-brand-purple uppercase mb-3">
                ¿Cómo gano puntos?
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                {[
                  { emoji: "🛒", text: "1 punto por cada $1 comprado" },
                  { emoji: "📧", text: "Suscríbete al newsletter: +50 pts" },
                  { emoji: "⭐", text: "Escribe una reseña: +25 pts" },
                ].map((tip) => (
                  <div key={tip.text} className="flex items-start gap-2">
                    <span className="text-xl">{tip.emoji}</span>
                    <p className="text-neutral-dark">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Order history */}
        {activeTab === "historial" && (
          <motion.div
            key="historial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="font-heading text-2xl text-neutral-dark uppercase mb-5">
              Mis Pedidos
            </h2>
            {currentUser.historial.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📦</div>
                <p className="font-heading text-lg text-neutral-dark uppercase">
                  Sin pedidos aún
                </p>
                <p className="text-ui-400 text-sm mt-1">
                  ¡Haz tu primera compra y acumula puntos!
                </p>
                <a
                  href="/categorias"
                  className="mt-4 inline-block bg-brand-orange text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-orange-dark transition-colors"
                >
                  Ver catálogo
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {currentUser.historial.map((order, i) => {
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-ui-100 rounded-2xl overflow-hidden"
                    >
                      {/* Order header row */}
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                        className="w-full flex items-center justify-between gap-4 p-4 hover:bg-ui-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center shrink-0">
                            <svg
                              className="w-5 h-5 text-brand-purple"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-neutral-dark text-sm">
                              {order.id}
                            </p>
                            <p className="text-xs text-ui-400">
                              {order.fecha} · {order.items} artículo(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-brand-orange">
                              ${order.total.toFixed(2)}
                            </p>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                order.estado === "Entregado"
                                  ? "bg-green-100 text-green-700"
                                  : order.estado === "Procesando"
                                    ? "bg-brand-yellow/30 text-neutral-dark"
                                    : "bg-ui-100 text-ui-400"
                              }`}
                            >
                              {order.estado}
                            </span>
                            <p className="text-xs text-brand-purple mt-0.5">
                              +{order.puntos} pts
                            </p>
                          </div>
                          <svg
                            className={`w-4 h-4 text-ui-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded order detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-ui-100 px-4 py-3">
                              {order.lineas && order.lineas.length > 0 ? (
                                <div className="space-y-2 mb-3">
                                  {order.lineas.map((linea, j) => (
                                    <div
                                      key={j}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-brand-purple/10 rounded text-brand-purple text-xs flex items-center justify-center font-bold shrink-0">
                                          {linea.cantidad}
                                        </span>
                                        <span className="text-neutral-dark">
                                          {linea.nombre}
                                        </span>
                                      </div>
                                      <span className="font-semibold text-neutral-dark shrink-0 ml-2">
                                        $
                                        {(
                                          linea.precio * linea.cantidad
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="pt-2 border-t border-ui-100 flex justify-between text-sm font-bold">
                                    <span>Total</span>
                                    <span className="text-brand-orange">
                                      ${order.total.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-ui-400 mb-3">
                                  Detalle no disponible
                                </p>
                              )}
                              <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-purple hover:text-brand-orange transition-colors"
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
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Descargar Factura
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Profile */}
        {activeTab === "perfil" && (
          <motion.div
            key="perfil"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="font-heading text-2xl text-neutral-dark uppercase mb-5">
              Mi Perfil
            </h2>
            <div className="bg-white rounded-2xl border border-ui-100 p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ui-400 uppercase tracking-wide block mb-1">
                    Nombre
                  </label>
                  <p className="font-semibold text-neutral-dark">
                    {currentUser.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ui-400 uppercase tracking-wide block mb-1">
                    Email
                  </label>
                  <p className="font-semibold text-neutral-dark">
                    {currentUser.email}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ui-400 uppercase tracking-wide block mb-1">
                    Puntos totales
                  </label>
                  <p className="font-semibold text-brand-orange">
                    {currentUser.puntos} puntos
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ui-400 uppercase tracking-wide block mb-1">
                    Nivel
                  </label>
                  <p className="font-semibold text-neutral-dark">
                    {puntosNivel}
                  </p>
                </div>
              </div>

              {currentUser.codigosUsados.length > 0 && (
                <div className="pt-4 border-t border-ui-100">
                  <label className="text-xs font-semibold text-ui-400 uppercase tracking-wide block mb-2">
                    Códigos usados
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {currentUser.codigosUsados.map((c) => (
                      <code
                        key={c}
                        className="bg-ui-50 border border-ui-100 text-xs px-2 py-1 rounded font-mono"
                      >
                        {c}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-ui-100">
                <button
                  onClick={() => logout()}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-2 transition-colors"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
