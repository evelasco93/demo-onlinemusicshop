import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  cartItems,
  clearCart,
  removeFromCart,
  updateQuantity,
} from "../stores/cart";
import {
  user,
  addPuntos,
  addOrderToHistory,
  addCodigoUsado,
} from "../stores/user";
import { stockMap, decrementStock } from "../stores/stock";
import { adminCatalog, type RuntimeDiscountCode } from "../stores/catalogAdmin";

function detectCardType(number: string): "visa" | "mastercard" | "unknown" {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || n === "5" || /^2[2-7]/.test(n)) return "mastercard";
  return "unknown";
}

function CardIcon({ type }: { type: "visa" | "mastercard" | "unknown" }) {
  if (type === "visa") {
    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <img src="/visa.png" alt="Visa" className="h-6 w-auto object-contain" />
      </div>
    );
  }
  if (type === "mastercard") {
    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <img
          src="/mc.png"
          alt="Mastercard"
          className="h-6 w-auto object-contain"
        />
      </div>
    );
  }
  return null;
}

interface Form {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  notas: string;
  card: string;
  cardExp: string;
  cardCvv: string;
}

export default function CheckoutForm() {
  const items = useStore(cartItems);
  const currentUser = useStore(user);
  const stock = useStore(stockMap);
  const catalogState = useStore(adminCatalog);

  const [form, setForm] = useState<Form>({
    nombre: currentUser.isLoggedIn ? currentUser.nombre : "",
    email: currentUser.isLoggedIn ? currentUser.email : "",
    telefono: "",
    direccion: "",
    ciudad: "",
    departamento: "San Salvador",
    notas: "",
    card: "",
    cardExp: "",
    cardCvv: "",
  });
  const [codigoInput, setCodigoInput] = useState("");
  const [codigoAplicado, setCodigoAplicado] = useState<{
    codigo: string;
    porcentaje: number;
    descripcion: string;
    appliesTo: RuntimeDiscountCode["appliesTo"];
  } | null>(null);
  const [codigoError, setCodigoError] = useState("");
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"envio" | "tienda">("envio");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Form>>({});

  const subtotal = items.reduce((s, i) => s + i.precioFinal * i.cantidad, 0);
  const shippingCost = deliveryType === "tienda" ? 0 : subtotal >= 25 ? 0 : 8;
  const descuentoSubtotal = useMemo(() => {
    if (!codigoAplicado) return 0;
    if (codigoAplicado.appliesTo === "all") return subtotal;
    const allowedIds = codigoAplicado.appliesTo;
    return items.reduce((acc, item) => {
      const matches = allowedIds.some(
        (id) => item.id === id || item.id.startsWith(`${id}-`),
      );
      if (!matches) return acc;
      return acc + item.precioFinal * item.cantidad;
    }, 0);
  }, [codigoAplicado, items, subtotal]);
  const codigoDescuento = codigoAplicado
    ? descuentoSubtotal * (codigoAplicado.porcentaje / 100)
    : 0;
  const loyaltyDescuento =
    useLoyaltyPoints && currentUser.isLoggedIn
      ? Math.min(currentUser.puntos, subtotal * 0.2) // max 20% with points
      : 0;
  const total = Math.max(
    0,
    subtotal - codigoDescuento - loyaltyDescuento + shippingCost,
  );
  const pointsToEarn = Math.floor(total);

  const applyCode = () => {
    const upper = codigoInput.trim().toUpperCase();
    const def = catalogState.discountCodes[upper];
    if (!def) {
      setCodigoError("Código no válido");
      return;
    }
    if (!def.active) {
      setCodigoError("Este código está inactivo");
      return;
    }
    if (
      def.unico &&
      currentUser.isLoggedIn &&
      currentUser.codigosUsados.includes(upper)
    ) {
      setCodigoError("Este código ya fue utilizado");
      return;
    }
    if (def.unico && !currentUser.isLoggedIn) {
      setCodigoError("Inicia sesión para usar códigos de primer compra");
      return;
    }
    if (def.appliesTo !== "all") {
      const ids: string[] = def.appliesTo;
      const applicable = items.some((item) =>
        ids.some(
          (id: string) => item.id === id || item.id.startsWith(`${id}-`),
        ),
      );
      if (!applicable) {
        setCodigoError("Este código no aplica a los productos del carrito");
        return;
      }
    }
    setCodigoAplicado({ codigo: upper, ...def });
    setCodigoError("");
  };

  const validate = () => {
    const errs: Partial<Form> = {};
    if (!form.nombre.trim()) errs.nombre = "Requerido";
    if (!form.email.includes("@")) errs.email = "Email no válido";
    if (deliveryType === "envio" && !form.direccion.trim())
      errs.direccion = "Requerido";
    if (deliveryType === "envio" && !form.ciudad.trim())
      errs.ciudad = "Requerido";
    const cardType = detectCardType(form.card);
    if (form.card.replace(/\s/g, "").length < 16)
      errs.card = "Número incompleto";
    else if (cardType === "unknown")
      errs.card = "Solo aceptamos Visa y Mastercard";
    if (form.cardExp.length < 5) errs.cardExp = "Formato MM/AA";
    if (form.cardCvv.length < 3) errs.cardCvv = "CVV inválido";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (items.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Decrement stock
    items.forEach((item) => decrementStock(item.id, item.cantidad));

    // Add order to user history
    const oid = `ORD-${Date.now().toString().slice(-6)}`;
    if (currentUser.isLoggedIn) {
      addOrderToHistory({
        id: oid,
        fecha: new Date().toLocaleDateString("es-SV"),
        total,
        puntos: pointsToEarn,
        estado: "Procesando",
        items: items.length,
        lineas: items.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio: i.precioFinal,
        })),
      });
      addPuntos(pointsToEarn);
      if (codigoAplicado) addCodigoUsado(codigoAplicado.codigo);
    }

    clearCart();
    setOrderId(oid);
    setOrderSuccess(true);
    setLoading(false);
  };

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-white"
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
        </div>
        <h1 className="font-heading text-4xl text-neutral-dark uppercase">
          ¡Orden confirmada!
        </h1>
        <p className="text-ui-400 mt-3 text-lg">
          Tu pedido{" "}
          <span className="font-bold text-brand-orange">{orderId}</span> ha sido
          recibido.
        </p>
        {deliveryType === "tienda" && (
          <p className="text-green-700 text-sm mt-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
            📍 Tu orden estará lista en <strong>2 horas</strong> para recoger en
            Hillside Mall, C. La Mascota, San Salvador
          </p>
        )}
        {currentUser.isLoggedIn && (
          <p className="text-brand-purple text-sm mt-2">
            🌟 Ganaste <strong>{pointsToEarn} puntos</strong> de lealtad
          </p>
        )}
        <div className="mt-8 flex gap-3 justify-center">
          <a
            href="/"
            className="bg-brand-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors"
          >
            Seguir comprando
          </a>
          {currentUser.isLoggedIn && (
            <a
              href="/cuenta"
              className="bg-brand-purple text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-purple-light transition-colors"
            >
              Mi cuenta
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-ui-50 rounded-full flex items-center justify-center mx-auto mb-4">
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
        <h2 className="font-heading text-2xl text-neutral-dark uppercase">
          Tu carrito está vacío
        </h2>
        <p className="text-ui-400 mt-2 text-sm">
          Agrega productos antes de continuar
        </p>
        <a
          href="/categorias"
          className="mt-6 inline-block bg-brand-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors"
        >
          Ver catálogo
        </a>
      </div>
    );
  }

  const inputClass = (field: keyof Form) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all ${
      formErrors[field] ? "border-red-400 bg-red-50" : "border-ui-100"
    }`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-4xl text-neutral-dark uppercase mb-8">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-ui-100 p-6">
            <h2 className="font-heading text-xl text-neutral-dark uppercase mb-4">
              1. Información de Contacto
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-dark block mb-1">
                  Nombre completo *
                </label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className={inputClass("nombre")}
                  placeholder="Juan García"
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {formErrors.nombre}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-dark block mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass("email")}
                  placeholder="juan@correo.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-dark block mb-1">
                  Teléfono
                </label>
                <input
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  className={inputClass("telefono")}
                  placeholder="(503) 7777-0000"
                />
              </div>
            </div>
          </div>

          {/* Delivery type */}
          <div className="bg-white rounded-2xl border border-ui-100 p-6">
            <h2 className="font-heading text-xl text-neutral-dark uppercase mb-4">
              2. Método de Entrega
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType("envio")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  deliveryType === "envio"
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-ui-100 hover:border-brand-orange/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-5 h-5 text-brand-orange"
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
                  <span className="font-semibold text-sm text-neutral-dark">
                    Envío a domicilio
                  </span>
                </div>
                <p className="text-xs text-ui-400">
                  {subtotal >= 25 ? "Gratis" : "$8.00"} · 1–3 días hábiles
                </p>
              </button>
              <button
                onClick={() => setDeliveryType("tienda")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  deliveryType === "tienda"
                    ? "border-green-500 bg-green-50"
                    : "border-ui-100 hover:border-green-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  <span className="font-semibold text-sm text-neutral-dark">
                    Recoger en tienda
                  </span>
                </div>
                <p className="text-xs text-green-700 font-semibold">
                  Gratis · Lista en 2 horas
                </p>
                <p className="text-xs text-ui-400 mt-0.5">
                  Hillside Mall, C. La Mascota, San Salvador
                </p>
              </button>
            </div>
            {deliveryType === "tienda" && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
                <strong className="block mb-2">
                  Pasos para recoger tu orden:
                </strong>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    Recibirás un correo cuando tu orden esté lista para recoger.
                  </li>
                  <li>
                    Tienes <strong>30 días</strong> para recogerla; de lo
                    contrario se procesará un reembolso automático.
                  </li>
                  <li>
                    Para cambiar la persona autorizada, envíanos un correo a{" "}
                    <strong>info@onlinemusicshop.com</strong> con tu número de
                    orden, dui y nombre de la persona autorizada.
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Shipping address — only if delivery */}
          {deliveryType === "envio" && (
            <div className="bg-white rounded-2xl border border-ui-100 p-6">
              <h2 className="font-heading text-xl text-neutral-dark uppercase mb-4">
                3. Dirección de Envío
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-dark block mb-1">
                    Dirección *
                  </label>
                  <input
                    value={form.direccion}
                    onChange={(e) =>
                      setForm({ ...form, direccion: e.target.value })
                    }
                    className={inputClass("direccion")}
                    placeholder="Calle Los Pinos, Colonia Escalón, Casa #15"
                  />
                  {formErrors.direccion && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formErrors.direccion}
                    </p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-dark block mb-1">
                      Ciudad *
                    </label>
                    <input
                      value={form.ciudad}
                      onChange={(e) =>
                        setForm({ ...form, ciudad: e.target.value })
                      }
                      className={inputClass("ciudad")}
                      placeholder="San Salvador"
                    />
                    {formErrors.ciudad && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {formErrors.ciudad}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-dark block mb-1">
                      Departamento
                    </label>
                    <select
                      value={form.departamento}
                      onChange={(e) =>
                        setForm({ ...form, departamento: e.target.value })
                      }
                      className="w-full border border-ui-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      {[
                        "San Salvador",
                        "Santa Ana",
                        "San Miguel",
                        "La Libertad",
                        "Sonsonate",
                        "Usulután",
                        "San Vicente",
                        "La Paz",
                        "Chalatenango",
                        "Cuscatlán",
                        "La Unión",
                        "Morazán",
                        "Ahuachapán",
                        "Cabañas",
                      ].map((dep) => (
                        <option key={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-dark block mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    value={form.notas}
                    onChange={(e) =>
                      setForm({ ...form, notas: e.target.value })
                    }
                    rows={2}
                    className="w-full border border-ui-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                    placeholder="Referencias de entrega, instrucciones especiales..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-ui-100 p-6">
            <h2 className="font-heading text-xl text-neutral-dark uppercase mb-2">
              {deliveryType === "tienda" ? "3" : "4"}. Información de Pago
            </h2>
            {/* Accepted cards */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-ui-400">Aceptamos:</span>
              <img
                src="/visa.png"
                alt="Visa"
                className="h-7 w-auto object-contain"
              />
              <img
                src="/mc.png"
                alt="Mastercard"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="bg-ui-50 border border-ui-100 rounded-xl px-4 py-2.5 mb-4 text-xs text-ui-400 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Formulario de demostración — no ingreses datos reales
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-dark block mb-1">
                  Número de tarjeta *
                </label>
                <div className="relative">
                  <input
                    value={form.card}
                    onChange={(e) => {
                      const v = e.target.value
                        .replace(/[^\d]/g, "")
                        .slice(0, 16);
                      setForm({
                        ...form,
                        card: v.replace(/(\d{4})(?=\d)/g, "$1 ").trim(),
                      });
                    }}
                    className={inputClass("card") + " pr-14"}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  <CardIcon type={detectCardType(form.card)} />
                </div>
                {formErrors.card && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {formErrors.card}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-dark block mb-1">
                    Vencimiento *
                  </label>
                  <input
                    value={form.cardExp}
                    onChange={(e) => {
                      const v = e.target.value
                        .replace(/[^\d]/g, "")
                        .slice(0, 4);
                      setForm({
                        ...form,
                        cardExp:
                          v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v,
                      });
                    }}
                    className={inputClass("cardExp")}
                    placeholder="MM/AA"
                    maxLength={5}
                  />
                  {formErrors.cardExp && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formErrors.cardExp}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-dark block mb-1">
                    CVV *
                  </label>
                  <input
                    value={form.cardCvv}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    className={inputClass("cardCvv")}
                    placeholder="123"
                    maxLength={4}
                  />
                  {formErrors.cardCvv && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formErrors.cardCvv}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cart items */}
          <div className="bg-white rounded-2xl border border-ui-100 p-5">
            <h2 className="font-heading text-xl text-neutral-dark uppercase mb-4">
              Tu Pedido ({items.reduce((s, i) => s + i.cantidad, 0)} artículos)
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <img
                    src={
                      item.imagen ||
                      `https://placehold.co/48x48/2E144F/FFFFFF?text=${encodeURIComponent(item.marca)}`
                    }
                    alt={item.nombre}
                    className="w-12 h-12 object-contain rounded-lg bg-ui-50 border border-ui-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/48x48/2E144F/FFFFFF?text=OMS`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-dark line-clamp-2">
                      {item.nombre}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 bg-ui-50 rounded border border-ui-100 text-xs">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cantidad - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-brand-orange font-bold"
                        >
                          −
                        </button>
                        <span className="w-5 text-center">{item.cantidad}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cantidad + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-brand-orange font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-bold text-brand-orange">
                        ${(item.precioFinal * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-ui-400 hover:text-red-500 p-0.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
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
              ))}
            </div>
          </div>

          {/* Discount code */}
          <div className="bg-white rounded-2xl border border-ui-100 p-5">
            <h3 className="font-heading text-base text-neutral-dark uppercase mb-3">
              Código de Descuento
            </h3>
            {codigoAplicado ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <div>
                  <p className="text-green-700 text-sm font-bold">
                    {codigoAplicado.codigo}
                  </p>
                  <p className="text-green-600 text-xs">
                    {codigoAplicado.descripcion}
                  </p>
                </div>
                <button
                  onClick={() => setCodigoAplicado(null)}
                  className="text-red-400 hover:text-red-600 text-xs underline"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={codigoInput}
                  onChange={(e) => {
                    setCodigoInput(e.target.value.toUpperCase());
                    setCodigoError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && applyCode()}
                  placeholder="Ej: PRIMERA10"
                  className={`flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange font-mono tracking-wide ${codigoError ? "border-red-400" : "border-ui-100"}`}
                />
                <button
                  onClick={applyCode}
                  className="bg-brand-purple text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-purple-light transition-colors"
                >
                  Aplicar
                </button>
              </div>
            )}
            {codigoError && (
              <p className="text-red-500 text-xs mt-1">{codigoError}</p>
            )}
            {!codigoAplicado && (
              <p className="text-xs text-ui-400 mt-2">
                Prueba:{" "}
                <button
                  onClick={() => {
                    setCodigoInput("PRIMERA10");
                    setCodigoError("");
                  }}
                  className="text-brand-orange underline"
                >
                  PRIMERA10
                </button>
                ,{" "}
                <button
                  onClick={() => {
                    setCodigoInput("OMS2026");
                    setCodigoError("");
                  }}
                  className="text-brand-orange underline"
                >
                  OMS2026
                </button>
              </p>
            )}
          </div>

          {/* Loyalty points */}
          {currentUser.isLoggedIn && currentUser.puntos > 0 && (
            <div className="bg-white rounded-2xl border border-ui-100 p-5">
              <h3 className="font-heading text-base text-neutral-dark uppercase mb-3">
                Puntos de Lealtad
              </h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLoyaltyPoints}
                  onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                  className="mt-0.5 accent-brand-orange"
                />
                <div>
                  <p className="text-sm font-semibold text-neutral-dark">
                    Usar mis {currentUser.puntos} puntos
                  </p>
                  <p className="text-xs text-ui-400 mt-0.5">
                    Descuento de hasta 20% del subtotal. Ahorra $
                    {loyaltyDescuento.toFixed(2)}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl border border-ui-100 p-5 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-ui-400">Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {codigoAplicado && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento ({codigoAplicado.codigo})</span>
                <span>-${codigoDescuento.toFixed(2)}</span>
              </div>
            )}
            {useLoyaltyPoints && loyaltyDescuento > 0 && (
              <div className="flex justify-between text-sm text-brand-purple">
                <span>Puntos de lealtad</span>
                <span>-${loyaltyDescuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-ui-400">Envío</span>
              <span
                className={
                  shippingCost === 0
                    ? "text-green-600 font-semibold"
                    : "font-semibold"
                }
              >
                {shippingCost === 0
                  ? "¡Gratis!"
                  : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-ui-100 pt-2.5 flex justify-between">
              <span className="font-heading text-lg text-neutral-dark uppercase">
                Total
              </span>
              <span className="font-heading text-2xl text-brand-orange font-bold">
                ${total.toFixed(2)}
              </span>
            </div>
            {currentUser.isLoggedIn && (
              <div className="flex items-center gap-1.5 text-xs text-brand-purple pt-1">
                <svg
                  className="w-3.5 h-3.5 text-brand-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Ganarás {pointsToEarn} puntos con esta compra
              </div>
            )}
          </div>

          {/* Place order button */}
          <motion.button
            onClick={handlePlaceOrder}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-4 rounded-xl font-heading font-bold text-lg uppercase tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-brand-orange/30 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Procesando...
              </>
            ) : (
              <>
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Confirmar Pedido · ${total.toFixed(2)}
              </>
            )}
          </motion.button>

          <p className="text-xs text-ui-400 text-center">
            Al confirmar aceptas nuestros{" "}
            <a href="#" className="text-brand-orange underline">
              Términos de Uso
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
