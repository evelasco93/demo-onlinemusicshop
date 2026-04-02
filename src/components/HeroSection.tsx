import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: "nueva-temporada",
    badge: "Nueva Temporada 2026",
    title: ["Tu música,", "tu pasión,", "nuestras cuerdas."],
    titleHighlight: [false, false, true],
    subtitle:
      "Guitarras, pedales y amplificadores de las mejores marcas internacionales.",
    cta: { label: "Ver Catálogo", href: "/categorias" },
    cta2: {
      label: "Producto Destacado",
      href: "/producto/tagima-stella-sonic-blue",
    },
    image: "https://tagimaguitars.com/cdn/shop/files/5b2.jpg?v=1752775583",
    imageFallback:
      "https://placehold.co/400x400/2E144F/F77021?text=Tagima+Stella",
    imageLabel: "Tagima Stella Brasil",
    imagePrice: "$1,899.00",
    imageBadge: "DESTACADO",
    bg: "linear-gradient(135deg, #2E144F 0%, #1a0c30 60%, #0f0820 100%)",
    accentColor: "#F77021",
  },
  {
    id: "valeton-sale",
    badge: "🔥 Oferta Activa · -20% OFF",
    title: ["Valeton GP-100:", "el multiefectos", "que necesitas."],
    titleHighlight: [true, false, false],
    subtitle:
      "De $200 a solo $160. Más de 140 efectos profesionales en un solo pedal compacto.",
    cta: { label: "Ver Oferta", href: "/producto/valeton-gp100" },
    cta2: { label: "Ver Pedales", href: "/categorias/pedales" },
    image:
      "https://siman.vtexassets.com/arquivos/ids/6309942-1200-auto?v=638659027074800000&width=1200&height=auto&aspect=true",
    imageFallback:
      "https://placehold.co/400x400/1a0c30/FFD12A?text=Valeton+GP-100",
    imageLabel: "Valeton GP-100",
    imagePrice: "$160.00",
    imageBadge: "-20% OFF",
    bg: "linear-gradient(135deg, #1a0c30 0%, #2E144F 50%, #3d1a00 100%)",
    accentColor: "#FFD12A",
  },
  {
    id: "tagima-collection",
    badge: "Colección Tagima 2026",
    title: ["Guitarras que", "inspiran a los", "grandes músicos."],
    titleHighlight: [false, false, true],
    subtitle:
      "Tagima Brasil — construidas para sonar diferente. Desde la Stella hasta la clásica T-640.",
    cta: { label: "Ver Guitarras Tagima", href: "/categorias?marca=Tagima" },
    cta2: { label: "Ver Catálogo", href: "/categorias/guitarras" },
    image: "https://tagimaguitars.com/cdn/shop/files/640_PINK.jpg?v=1766100342",
    imageFallback: "https://placehold.co/400x400/2E144F/F77021?text=Tagima",
    imageLabel: "Tagima Collection",
    imagePrice: "Desde $549",
    imageBadge: "NUEVO",
    bg: "linear-gradient(135deg, #0f0820 0%, #2E144F 60%, #1a0c30 100%)",
    accentColor: "#F77021",
  },
  {
    id: "valeton-gp200x",
    badge: "⭐ Más Vendido",
    title: ["Valeton GP-200X:", "multiefectos", "profesional."],
    titleHighlight: [true, false, false],
    subtitle:
      "El procesador todo-en-uno con amplis, efectos y conectividad USB. Estudio y escenario.",
    cta: { label: "Ver GP-200X", href: "/producto/valeton-gp200x" },
    cta2: { label: "Ver Valeton Series", href: "/categorias?marca=Valeton" },
    image:
      "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/30972/129207/GP-200X-1__71985.1744631263.jpg?c=1",
    imageFallback:
      "https://placehold.co/400x400/1a0c30/F77021?text=Valeton+GP-200X",
    imageLabel: "Valeton GP-200X",
    imagePrice: "$525.00",
    imageBadge: "TOP VENTAS",
    bg: "linear-gradient(135deg, #1a0c30 0%, #0f0820 60%, #2E144F 100%)",
    accentColor: "#F77021",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const go = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrent((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => go(current + 1, 1), 5500);
    return () => clearInterval(timer);
  }, [current, go]);

  const slide = SLIDES[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section
      className="relative overflow-hidden min-h-[380px] sm:min-h-[460px] md:min-h-[620px]"
      style={{ background: slide.bg }}
    >
      {/* Animated background transition */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{ background: slide.bg }}
        />
      </AnimatePresence>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Accent glow */}
      <div
        className="absolute right-0 top-0 w-72 h-72 md:w-[500px] md:h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${slide.accentColor} 0%, transparent 70%)`,
        }}
      />

      {/* Slide */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="relative max-w-7xl mx-auto px-12 sm:px-10 md:px-6 lg:px-8 w-full py-10 sm:py-12 md:py-20 flex items-center min-h-[380px] sm:min-h-[460px] md:min-h-[620px]"
        >
          <div className="grid sm:grid-cols-2 gap-6 items-center w-full">
            {/* Left: Text */}
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: slide.accentColor }}
                />
                {slide.badge}
              </span>

              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white uppercase leading-tight">
                {slide.title.map((line, i) =>
                  slide.titleHighlight[i] ? (
                    <span key={i} style={{ color: slide.accentColor }}>
                      {line}{" "}
                    </span>
                  ) : (
                    <span key={i}>{line} </span>
                  ),
                )}
              </h1>

              <p className="mt-3 text-white/70 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
                {slide.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={slide.cta.href}
                  className="text-white px-8 py-3.5 rounded-xl font-heading font-semibold uppercase tracking-wide transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: slide.accentColor,
                    color:
                      slide.accentColor === "#FFD12A" ? "#1f1f1f" : "white",
                  }}
                >
                  {slide.cta.label}
                </a>
                <a
                  href={slide.cta2.href}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3.5 rounded-xl font-heading font-semibold uppercase tracking-wide transition-all duration-200 backdrop-blur-sm"
                >
                  {slide.cta2.label}
                </a>
              </div>
            </div>

            {/* Right: Product image */}
            <div className="hidden sm:flex justify-center">
              <div className="relative">
                <div
                  className="absolute inset-0 blur-2xl rounded-full scale-110 opacity-20"
                  style={{ background: slide.accentColor }}
                />
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <img
                    src={slide.image}
                    alt={slide.imageLabel}
                    className="w-44 h-44 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = slide.imageFallback;
                    }}
                  />
                </motion.div>

                <div
                  className="absolute -top-4 -right-4 font-heading font-bold text-sm px-3 py-2 rounded-xl shadow-lg"
                  style={{
                    background: slide.accentColor,
                    color:
                      slide.accentColor === "#FFD12A" ? "#1f1f1f" : "white",
                  }}
                >
                  {slide.imageBadge}
                </div>

                <div className="absolute -bottom-2 left-0 bg-white text-neutral-dark rounded-xl shadow-xl px-4 py-2">
                  <p className="text-xs text-ui-400 font-medium">
                    {slide.imageLabel}
                  </p>
                  <p
                    className="font-heading font-bold text-xl"
                    style={{ color: slide.accentColor }}
                  >
                    {slide.imagePrice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={() => go(current - 1, -1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
        aria-label="Anterior"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={() => go(current + 1, 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
        aria-label="Siguiente"
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i, i > current ? 1 : -1)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              background:
                i === current ? slide.accentColor : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
