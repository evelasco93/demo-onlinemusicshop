import { motion } from "framer-motion";

const categories = [
  {
    id: "guitarras",
    nombre: "Guitarras",
    descripcion: "Eléctricas · Acústicas · Basswood",
    count: 4,
    color: "#F77021",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Neck */}
        <rect x="36" y="6" width="8" height="34" rx="4" fill="currentColor" />
        {/* Headstock */}
        <rect x="34" y="4" width="12" height="10" rx="3" fill="currentColor" opacity="0.9" />
        {/* Tuning pegs */}
        <circle cx="32" cy="7" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="32" cy="13" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="32" cy="19" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="48" cy="7" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="48" cy="13" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="48" cy="19" r="3" fill="currentColor" opacity="0.7" />
        {/* Fret markers */}
        <circle cx="40" cy="26" r="1.8" fill="white" opacity="0.6" />
        <circle cx="40" cy="33" r="1.8" fill="white" opacity="0.6" />
        {/* Body upper bout */}
        <ellipse cx="40" cy="52" rx="18" ry="14" fill="currentColor" opacity="0.9" />
        {/* Body lower bout */}
        <ellipse cx="40" cy="64" rx="22" ry="16" fill="currentColor" />
        {/* Body waist cutaway */}
        <ellipse cx="40" cy="58" rx="12" ry="6" fill="currentColor" opacity="0.85" />
        {/* Soundhole */}
        <circle cx="40" cy="60" r="7" fill="white" opacity="0.18" />
        <circle cx="40" cy="60" r="4" fill="white" opacity="0.12" />
        {/* Bridge */}
        <rect x="32" y="69" width="16" height="4" rx="2" fill="white" opacity="0.4" />
        {/* Strings */}
        <line x1="37" y1="14" x2="35" y2="69" stroke="white" strokeWidth="0.7" opacity="0.5" />
        <line x1="39" y1="14" x2="38" y2="69" stroke="white" strokeWidth="0.7" opacity="0.5" />
        <line x1="41" y1="14" x2="42" y2="69" stroke="white" strokeWidth="0.7" opacity="0.5" />
        <line x1="43" y1="14" x2="45" y2="69" stroke="white" strokeWidth="0.7" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "pedales",
    nombre: "Pedales",
    descripcion: "Multiefectos · Procesadores · Loopers",
    count: 4,
    color: "#2E144F",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Main pedal body */}
        <rect x="8" y="20" width="64" height="44" rx="8" fill="currentColor" />
        {/* Top panel angled face */}
        <rect x="10" y="16" width="60" height="16" rx="6" fill="currentColor" opacity="0.8" />
        {/* Display screen */}
        <rect x="12" y="19" width="26" height="10" rx="3" fill="white" opacity="0.15" />
        <rect x="13" y="20" width="24" height="8" rx="2" fill="#0ff" opacity="0.08" />
        {/* Knobs row */}
        <circle cx="52" cy="24" r="4.5" fill="white" opacity="0.35" />
        <circle cx="52" cy="24" r="2" fill="white" opacity="0.6" />
        <circle cx="62" cy="24" r="4.5" fill="white" opacity="0.35" />
        <circle cx="62" cy="24" r="2" fill="white" opacity="0.6" />
        {/* Footswitches */}
        <circle cx="26" cy="46" r="11" fill="white" opacity="0.12" />
        <circle cx="26" cy="46" r="8" fill="white" opacity="0.2" />
        <circle cx="26" cy="46" r="5" fill="white" opacity="0.35" />
        <circle cx="54" cy="46" r="11" fill="white" opacity="0.12" />
        <circle cx="54" cy="46" r="8" fill="white" opacity="0.2" />
        <circle cx="54" cy="46" r="5" fill="white" opacity="0.35" />
        {/* LEDs */}
        <circle cx="26" cy="34" r="3" fill="#FFD12A" opacity="0.9" />
        <circle cx="54" cy="34" r="3" fill="#F77021" opacity="0.9" />
        {/* Input/Output jacks */}
        <rect x="4" y="48" width="6" height="8" rx="3" fill="currentColor" opacity="0.6" />
        <rect x="70" y="48" width="6" height="8" rx="3" fill="currentColor" opacity="0.6" />
        {/* Power jack */}
        <circle cx="40" cy="63" r="3" fill="white" opacity="0.25" />
      </svg>
    ),
  },
  {
    id: "amplificadores",
    nombre: "Amplificadores",
    descripcion: "Mini · Combo · Modelado Digital",
    count: 3,
    color: "#1A1A1A",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Cabinet body */}
        <rect x="6" y="18" width="68" height="52" rx="6" fill="currentColor" />
        {/* Cabinet texture/grille area */}
        <rect x="10" y="22" width="42" height="42" rx="4" fill="white" opacity="0.08" />
        {/* Speaker outer ring */}
        <circle cx="31" cy="43" r="18" fill="white" opacity="0.07" />
        <circle cx="31" cy="43" r="15" fill="currentColor" opacity="0.6" />
        <circle cx="31" cy="43" r="11" fill="white" opacity="0.07" />
        <circle cx="31" cy="43" r="7" fill="currentColor" opacity="0.5" />
        <circle cx="31" cy="43" r="3" fill="white" opacity="0.5" />
        {/* Grille dots pattern */}
        <circle cx="16" cy="28" r="1" fill="white" opacity="0.2" />
        <circle cx="20" cy="28" r="1" fill="white" opacity="0.2" />
        <circle cx="16" cy="32" r="1" fill="white" opacity="0.2" />
        {/* Control panel right side */}
        <rect x="56" y="24" width="14" height="38" rx="3" fill="white" opacity="0.07" />
        {/* Volume knob */}
        <circle cx="63" cy="33" r="5" fill="white" opacity="0.25" />
        <circle cx="63" cy="33" r="2.5" fill="white" opacity="0.5" />
        <line x1="63" y1="30" x2="63" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        {/* Gain knob */}
        <circle cx="63" cy="46" r="5" fill="white" opacity="0.25" />
        <circle cx="63" cy="46" r="2.5" fill="white" opacity="0.5" />
        <line x1="66" y1="44" x2="67" y2="42" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        {/* Power LED */}
        <circle cx="63" cy="58" r="3" fill="#F77021" opacity="0.9" />
        {/* Handle */}
        <path d="M24 18 Q31 13 38 18" stroke="white" strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "estuches",
    nombre: "Estuches",
    descripcion: "Fundas · Bolsos · Mochilas",
    count: 1,
    color: "#059669",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Case body */}
        <rect x="8" y="22" width="64" height="42" rx="8" fill="currentColor" />
        {/* Case lid */}
        <rect x="8" y="22" width="64" height="16" rx="8" fill="currentColor" opacity="0.7" />
        {/* Lid/body seam */}
        <line x1="8" y1="38" x2="72" y2="38" stroke="white" strokeWidth="1.5" opacity="0.3" />
        {/* Handle */}
        <path d="M30 22 Q40 14 50 22" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
        {/* Latches */}
        <rect x="24" y="35" width="10" height="6" rx="3" fill="white" opacity="0.4" />
        <rect x="46" y="35" width="10" height="6" rx="3" fill="white" opacity="0.4" />
        {/* Guitar silhouette inside */}
        <ellipse cx="40" cy="55" rx="10" ry="7" fill="white" opacity="0.12" />
        <ellipse cx="40" cy="49" rx="7" ry="4.5" fill="white" opacity="0.1" />
        <rect x="38" y="38" width="4" height="12" rx="2" fill="white" opacity="0.1" />
        {/* Corner protectors */}
        <rect x="8" y="22" width="6" height="6" rx="3" fill="white" opacity="0.15" />
        <rect x="66" y="22" width="6" height="6" rx="3" fill="white" opacity="0.15" />
        <rect x="8" y="58" width="6" height="6" rx="3" fill="white" opacity="0.15" />
        <rect x="66" y="58" width="6" height="6" rx="3" fill="white" opacity="0.15" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-ui-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-4xl text-neutral-dark uppercase">
            Explora por Categoría
          </h2>
          <p className="text-ui-400 mt-2 max-w-md mx-auto">
            Encuentra exactamente lo que necesitas para tu próxima sesión
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-5"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={cardVariants}>
              <a
                href={`/categorias/${cat.id}`}
                className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-ui-100 hover:-translate-y-1 h-full"
              >
                <div
                  className="h-44 flex items-center justify-center p-8 transition-colors duration-300"
                  style={{ backgroundColor: cat.color + "15" }}
                >
                  <div
                    className="w-20 h-20 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-xl text-neutral-dark uppercase">
                        {cat.nombre}
                      </h3>
                      <p className="text-ui-400 text-sm mt-0.5">
                        {cat.descripcion}
                      </p>
                    </div>
                    <span className="bg-ui-50 text-ui-400 text-xs font-semibold px-2 py-1 rounded-full border border-ui-100">
                      {cat.count}
                    </span>
                  </div>
                  <div
                    className="mt-4 flex items-center gap-1 text-sm font-semibold transition-all duration-200 group-hover:gap-2"
                    style={{ color: cat.color }}
                  >
                    Ver productos
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
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
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
