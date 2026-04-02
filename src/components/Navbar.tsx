import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { motion, AnimatePresence } from "framer-motion";
import { cartItems, cartOpen } from "../stores/cart";
import { user } from "../stores/user";
import { adminCatalog, getVisibleProducts } from "../stores/catalogAdmin";

const NAV_LINKS = [
  { href: "/categorias/guitarras", label: "Guitarras" },
  { href: "/categorias/pedales", label: "Pedales" },
  { href: "/categorias/amplificadores", label: "Amplificadores" },
  { href: "/nosotros", label: "Nosotros" },
];

const CATALOG_CATEGORIES = [
  { href: "/categorias/guitarras", label: "Guitarras Eléctricas" },
  { href: "/categorias/pedales", label: "Pedales y Multiefectos" },
  { href: "/categorias/amplificadores", label: "Amplificadores" },
  { href: "/categorias/estuches", label: "Estuches y Bolsos" },
  { href: "/categorias?todos=1", label: "Ver todo el catálogo" },
];

const CATALOG_FEATURED = [
  { href: "/categorias/guitarras", label: "Guitarras en oferta" },
  { href: "/categorias/pedales", label: "Pedales nuevos" },
  { href: "/cuenta", label: "Puntos de lealtad" },
];

export default function Navbar() {
  const items = useStore(cartItems);
  const currentUser = useStore(user);
  const catalogState = useStore(adminCatalog);
  const visibleProducts = useMemo(
    () => getVisibleProducts(catalogState.products),
    [catalogState.products],
  );
  const catalogBrands = useMemo(() => {
    const names = [...new Set(visibleProducts.map((p) => p.marca))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return names.map((nombre) => ({
      nombre,
      logo:
        catalogState.brandLogos[nombre] ||
        `/brands/${nombre.toLowerCase().replace(/\s+/g, "-")}.png`,
      href: `/categorias?marca=${encodeURIComponent(nombre)}`,
    }));
  }, [visibleProducts, catalogState.brandLogos]);
  const cartCount = items.reduce((s, i) => s + i.cantidad, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(visibleProducts);
  const [scrolled, setScrolled] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);
  const [cartBounce, setCartBounce] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > prevCount) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 400);
    }
    setPrevCount(cartCount);
  }, [cartCount]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = visibleProducts.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q),
    );
    setSearchResults(results.slice(0, 6));
  }, [searchQuery, visibleProducts]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "",
  );

  useEffect(() => {
    const update = () => setCurrentPath(window.location.pathname);
    document.addEventListener("astro:page-load", update);
    return () => document.removeEventListener("astro:page-load", update);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      {bannerVisible && (
        <div className="bg-brand-yellow text-neutral-dark text-xs font-semibold text-center py-2 px-4 overflow-hidden relative">
          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-center gap-8">
            <span>🎸 ¡ENVÍO GRATIS en pedidos mayores a $25!</span>
            <span>
              🎁 Usa el código{" "}
              <strong className="bg-brand-orange text-white px-1.5 py-0.5 rounded">
                PRIMERA10
              </strong>{" "}
              para 10% OFF en tu primera compra
            </span>
            <span>📞 2525-3357</span>
          </div>
          {/* Mobile - single compact line */}
          <div className="sm:hidden flex items-center justify-center gap-2 truncate pr-6">
            <span>🎸 Envío gratis +$25</span>
            <span className="opacity-30">·</span>
            <strong className="bg-brand-orange text-white px-1.5 py-0.5 rounded">
              PRIMERA10
            </strong>
            <span className="opacity-30">·</span>
            <span>📞 2525-3357</span>
          </div>
          {/* Close button */}
          <button
            onClick={() => setBannerVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/60 hover:text-neutral-dark transition-colors"
            aria-label="Cerrar banner"
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
      )}

      {/* Main navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-xl" : "shadow-md"
        }`}
        style={{ backgroundColor: "#2E144F" }}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="Online Music Shop"
                className="h-16 w-auto"
              />
            </a>

            {/* Desktop nav links — left side */}
            <div className="hidden md:flex items-center gap-1" ref={catalogRef}>
              {/* Catálogo mega-menu */}
              <div className="relative">
                <button
                  onClick={() => setCatalogOpen(!catalogOpen)}
                  onMouseEnter={() => setCatalogOpen(true)}
                  className={`px-3 py-2 text-sm font-semibold uppercase tracking-wide rounded transition-colors font-heading flex items-center gap-1 ${
                    currentPath.startsWith("/categorias") &&
                    !NAV_LINKS.some((l) => currentPath.startsWith(l.href))
                      ? "text-brand-yellow"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Catálogo
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {catalogOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      onMouseLeave={() => setCatalogOpen(false)}
                      className="absolute left-0 top-full mt-1 bg-white shadow-2xl rounded-xl border border-ui-100 z-50 overflow-hidden"
                      style={{ width: 540 }}
                    >
                      <div className="grid grid-cols-3 gap-0">
                        <div className="p-5 border-r border-ui-100">
                          <p className="text-xs font-bold text-ui-400 uppercase tracking-widest mb-3">
                            Categorías
                          </p>
                          <ul className="space-y-1">
                            {CATALOG_CATEGORIES.map((c) => (
                              <li key={c.href}>
                                <a
                                  href={c.href}
                                  onClick={() => setCatalogOpen(false)}
                                  className="block px-2 py-1.5 text-sm text-neutral-dark hover:text-brand-orange hover:bg-ui-50 rounded-lg transition-colors"
                                >
                                  {c.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-5 border-r border-ui-100">
                          <p className="text-xs font-bold text-ui-400 uppercase tracking-widest mb-3">
                            Marcas
                          </p>
                          <ul className="space-y-2">
                            {catalogBrands.map((m) => (
                              <li key={m.nombre}>
                                <a
                                  href={m.href}
                                  onClick={() => setCatalogOpen(false)}
                                  className="flex items-center gap-2 px-2 py-1 hover:bg-ui-50 rounded-lg transition-colors group"
                                >
                                  <img
                                    src={m.logo}
                                    alt={m.nombre}
                                    className="h-5 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                                  />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-5 bg-ui-50">
                          <p className="text-xs font-bold text-ui-400 uppercase tracking-widest mb-3">
                            Destacado
                          </p>
                          <ul className="space-y-1">
                            {CATALOG_FEATURED.map((d) => (
                              <li key={d.href}>
                                <a
                                  href={d.href}
                                  onClick={() => setCatalogOpen(false)}
                                  className="block px-2 py-1.5 text-sm font-semibold text-brand-purple hover:text-brand-orange transition-colors"
                                >
                                  {d.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 pt-4 border-t border-ui-100">
                            <a
                              href="/cuenta"
                              onClick={() => setCatalogOpen(false)}
                              className="block text-center bg-brand-orange text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-brand-orange-dark transition-colors"
                            >
                              🌟 Mis Puntos de Lealtad
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold uppercase tracking-wide rounded transition-colors font-heading ${
                    currentPath.startsWith(link.href)
                      ? "text-brand-yellow"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Search bar (desktop) — right side */}
            <div className="hidden md:flex w-72 lg:w-96 ml-auto relative">
              <div className="flex w-full rounded-full overflow-hidden bg-white shadow-sm">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (searchQuery.trim()) {
                        window.location.href = `/categorias?q=${encodeURIComponent(searchQuery.trim())}`;
                      }
                    }
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Buscar productos, marcas..."
                  className="flex-1 bg-transparent text-neutral-dark placeholder-ui-400 border-0 pl-6 pr-4 py-3 text-sm focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      window.location.href = `/categorias?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white px-5 flex items-center justify-center transition-colors shrink-0"
                  aria-label="Buscar"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Search dropdown */}
              <AnimatePresence>
                {searchOpen && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-ui-100"
                    onMouseLeave={() => setSearchOpen(false)}
                  >
                    {searchResults.map((p) => (
                      <a
                        key={p.id}
                        href={`/producto/${p.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-ui-50 transition-colors border-b border-ui-100 last:border-0"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <img
                          src={
                            p.imagenes[0] ||
                            `https://placehold.co/48x48/2E144F/FFFFFF?text=${encodeURIComponent(p.marca)}`
                          }
                          alt={p.nombre}
                          className="w-10 h-10 object-contain rounded bg-ui-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://placehold.co/48x48/2E144F/FFFFFF?text=${encodeURIComponent(p.marca)}`;
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-dark truncate">
                            {p.nombre}
                          </p>
                          <p className="text-xs text-ui-400">
                            {p.marca} · {p.categoria}
                          </p>
                        </div>
                        <span className="ml-auto text-brand-orange font-bold text-sm shrink-0">
                          ${p.precio}
                        </span>
                      </a>
                    ))}
                    <div className="px-4 py-2 bg-ui-50">
                      <a
                        href={`/categorias?q=${encodeURIComponent(searchQuery)}`}
                        className="text-xs text-brand-orange font-semibold"
                        onClick={() => setSearchOpen(false)}
                      >
                        Ver todos los resultados →
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 md:ml-0">
              {/* User icon with dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    if (!currentUser.isLoggedIn) {
                      window.location.href = "/login";
                    } else {
                      setUserMenuOpen(!userMenuOpen);
                    }
                  }}
                  className="p-2 text-white hover:text-brand-orange transition-colors relative"
                  aria-label={
                    currentUser.isLoggedIn ? "Mi cuenta" : "Iniciar sesión"
                  }
                >
                  {currentUser.isLoggedIn ? (
                    <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold">
                      {currentUser.nombre.charAt(0).toUpperCase()}
                    </div>
                  ) : (
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </button>

                {/* User dropdown */}
                <AnimatePresence>
                  {userMenuOpen && currentUser.isLoggedIn && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-ui-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 bg-ui-50 border-b border-ui-100">
                        <p className="text-xs font-bold text-neutral-dark truncate">
                          {currentUser.nombre}
                        </p>
                        <p className="text-xs text-ui-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <a
                        href="/cuenta"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-dark hover:bg-ui-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-brand-purple"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Ver Cuenta
                      </a>
                      {currentUser.isAdmin && (
                        <a
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-dark hover:bg-ui-50 transition-colors border-t border-ui-100"
                        >
                          <svg
                            className="w-4 h-4 text-brand-orange"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.08 3.324a1 1 0 00.95.69h3.495c.969 0 1.371 1.24.588 1.81l-2.827 2.055a1 1 0 00-.364 1.118l1.08 3.324c.3.921-.755 1.688-1.54 1.118l-2.827-2.055a1 1 0 00-1.176 0l-2.827 2.055c-.784.57-1.838-.197-1.539-1.118l1.08-3.324a1 1 0 00-.364-1.118L2.93 8.75c-.783-.57-.38-1.81.588-1.81h3.495a1 1 0 00.95-.69l1.086-3.323z"
                            />
                          </svg>
                          Panel Admin
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          import("../stores/user").then(({ logout }) =>
                            logout(),
                          );
                          window.location.href = "/";
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-ui-100"
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
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart icon */}
              <button
                onClick={() => cartOpen.set(true)}
                className="relative p-2 text-white hover:text-brand-orange transition-colors"
                aria-label={`Carrito, ${cartCount} artículos`}
              >
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
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-white hover:text-brand-orange transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menú"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-brand-purple-light border-t border-white/10"
            >
              <div className="px-4 py-3">
                {/* Mobile search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                {/* Categories section */}
                <div className="mb-3 pb-3 border-b border-white/10">
                  <p className="text-white/40 text-xs uppercase tracking-widest px-2 pb-2">
                    Categorías
                  </p>
                  {NAV_LINKS.filter((l) => l.href !== "/nosotros").map(
                    (link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className={`block px-3 py-2.5 font-heading uppercase tracking-wide text-sm transition-colors ${
                          currentPath.startsWith(link.href)
                            ? "text-brand-yellow"
                            : "text-white hover:text-brand-orange"
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </a>
                    ),
                  )}
                  <a
                    href="/categorias"
                    className="block px-3 py-2.5 text-brand-orange font-heading uppercase tracking-wide text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Ver todo el catálogo →
                  </a>
                </div>

                {/* Other links */}
                <a
                  href="/nosotros"
                  className={`block px-3 py-2.5 font-heading uppercase tracking-wide text-sm transition-colors ${
                    currentPath === "/nosotros"
                      ? "text-brand-yellow"
                      : "text-white hover:text-brand-orange"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  Nosotros
                </a>
                {currentUser.isLoggedIn && currentUser.isAdmin && (
                  <a
                    href="/admin"
                    className="block px-3 py-2.5 text-brand-orange font-heading uppercase tracking-wide text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Panel Admin
                  </a>
                )}
                {!currentUser.isLoggedIn && (
                  <a
                    href="/login"
                    className="block px-3 py-2.5 text-brand-yellow font-heading uppercase tracking-wide text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Iniciar Sesión
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Click outside to close search or catalog */}
      {searchOpen && searchResults.length > 0 && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setSearchOpen(false);
            setCatalogOpen(false);
          }}
        />
      )}
      {catalogOpen && !searchOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setCatalogOpen(false)}
        />
      )}
    </>
  );
}
