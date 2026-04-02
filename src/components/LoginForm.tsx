import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@nanostores/react";
import { user, login, logout } from "../stores/user";

export default function LoginForm() {
  const currentUser = useStore(user);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", nombre: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(form.email, form.password);
    if (!ok) {
      setError(
        "Credenciales incorrectas. Usa demo@oms.com / demo123 o admin@oms.com / admin123",
      );
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));
    login(form.email || "nuevo@oms.com", form.password || "pass");
    setLoading(false);
  };

  if (currentUser.isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-16 px-4"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-heading font-bold text-white"
          style={{ background: "linear-gradient(135deg, #F77021, #2E144F)" }}
        >
          {currentUser.nombre.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-heading text-3xl text-neutral-dark uppercase">
          ¡Hola, {currentUser.nombre}!
        </h1>
        <p className="text-ui-400 mt-2">{currentUser.email}</p>

        <div className="mt-6 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-brand-yellow"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-heading text-2xl text-brand-purple font-bold">
              {currentUser.puntos}
            </span>
          </div>
          <p className="text-xs text-ui-400">puntos de lealtad disponibles</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/cuenta"
            className="bg-brand-orange text-white py-3 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors"
          >
            Mi Cuenta y Lealtad
          </a>
          <a
            href="/categorias"
            className="bg-brand-purple text-white py-3 rounded-xl font-semibold hover:bg-brand-purple-light transition-colors"
          >
            Ir al Catálogo
          </a>
          <button
            onClick={() => logout()}
            className="text-sm text-ui-400 hover:text-red-500 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-16"
    >
      {/* Logo / heading */}
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="Online Music Shop"
          className="h-48 mx-auto mb-4"
        />
        <h1 className="font-heading text-3xl text-neutral-dark uppercase">
          {tab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
        </h1>
        <p className="text-ui-400 text-sm mt-1">
          {tab === "login"
            ? "Accede para gestionar tus pedidos y puntos"
            : "Únete y empieza a ganar puntos de lealtad"}
        </p>
      </div>

      {/* Demo hint */}
      {tab === "login" && (
        <div className="bg-brand-yellow/20 border border-brand-yellow/50 rounded-xl px-4 py-3 mb-6 text-xs text-neutral-dark">
          <p className="font-semibold">Cuenta demo:</p>
          <p>
            Email: <code className="bg-white px-1 rounded">demo@oms.com</code>
          </p>
          <p>
            Contraseña: <code className="bg-white px-1 rounded">demo123</code>
          </p>
          <p className="font-semibold mt-2">Admin:</p>
          <p>admin@oms.com / admin123</p>
          <p>manager@oms.com / manager123</p>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex bg-ui-50 border border-ui-100 rounded-xl p-1 mb-6">
        {[
          { key: "login", label: "Iniciar Sesión" },
          { key: "register", label: "Registrarse" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key as typeof tab);
              setError("");
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              tab === t.key
                ? "bg-white shadow-sm text-brand-orange"
                : "text-ui-400 hover:text-neutral-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.form
          key={tab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onSubmit={tab === "login" ? handleLogin : handleRegister}
          className="space-y-4"
        >
          {tab === "register" && (
            <div>
              <label className="text-xs font-semibold text-neutral-dark block mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                className="w-full border border-ui-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-dark block mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-ui-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-dark block mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="w-full border border-ui-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder={tab === "login" ? "••••••••" : "Mínimo 6 caracteres"}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-3.5 rounded-xl font-heading font-semibold uppercase tracking-wide transition-all hover:shadow-lg hover:shadow-brand-orange/30 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                Cargando...
              </>
            ) : tab === "login" ? (
              "Iniciar Sesión"
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </motion.form>
      </AnimatePresence>

      {/* Social proof */}
      <div className="mt-8 pt-6 border-t border-ui-100 text-center">
        <p className="text-xs text-ui-400 mb-3">Al registrarte obtienes:</p>
        <div className="flex justify-center gap-6 text-xs text-neutral-dark">
          {[
            { emoji: "⭐", text: "120 puntos de bienvenida" },
            { emoji: "🎁", text: "10% OFF primera compra" },
            { emoji: "📦", text: "Seguimiento de pedidos" },
          ].map((b) => (
            <div key={b.text} className="text-center">
              <div className="text-lg mb-1">{b.emoji}</div>
              <p className="text-ui-400">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
