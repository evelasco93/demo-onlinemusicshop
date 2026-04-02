import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WA_NUMBER = "50325253357";
const WA_MESSAGE = encodeURIComponent(
  "Hola! Me interesa saber más sobre sus productos en Online Music Shop.",
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(WA_URL)}&bgcolor=F4F4F5&color=1a1a1a&margin=8`;

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-0 bottom-28 z-50 flex items-flex-end">
      <AnimatePresence>
        {open && (
          <motion.div
            key="wa-panel"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="mr-2 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden border border-ui-100"
          >
            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.542 5.877L0 24l6.293-1.512A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.888 0-3.66-.513-5.184-1.407l-.371-.22-3.735.897.938-3.624-.24-.38A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">
                  Contáctanos
                </p>
                <p className="text-white/80 text-xs truncate">
                  Online Music Shop
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white/90 text-xs font-medium">
                  En línea
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-4 flex flex-col items-center gap-3">
              <p className="text-xs text-ui-500 text-center leading-relaxed">
                Escaneá el código o hacé clic para iniciar una conversación por
                WhatsApp.
              </p>

              <div className="bg-ui-50 rounded-xl p-2 border border-ui-100">
                <img
                  src={QR_URL}
                  alt="QR WhatsApp"
                  className="w-[140px] h-[140px] rounded-lg"
                />
              </div>

              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-heading font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors duration-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-white flex-shrink-0"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.542 5.877L0 24l6.293-1.512A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.888 0-3.66-.513-5.184-1.407l-.371-.22-3.735.897.938-3.624-.24-.38A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Abrir WhatsApp
              </a>

              <button
                onClick={() => setOpen(false)}
                className="text-xs text-ui-400 hover:text-ui-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ x: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex flex-col items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white w-11 rounded-l-2xl shadow-lg py-4 transition-colors duration-200 select-none"
        aria-label="Chat WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.542 5.877L0 24l6.293-1.512A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.888 0-3.66-.513-5.184-1.407l-.371-.22-3.735.897.938-3.624-.24-.38A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
        <span
          className="text-[10px] font-bold uppercase tracking-widest leading-none"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Chat
        </span>
      </motion.button>
    </div>
  );
}
