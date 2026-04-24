import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Inicio",
  "/mapa": "Mapa Inteligente",
  "/rutas": "Rutas Turísticas",
  "/lugares": "Lugares Imperdibles",
  "/directorio": "Directorio Local",
  "/eventos": "Agenda Cultural",
  "/comunidad": "Comunidad",
  "/historia": "Historia",
  "/cultura": "Cultura",
  "/relatos": "Relatos",
  "/ecoturismo": "Ecoturismo",
  "/gastronomia": "Gastronomía",
  "/arte": "Arte",
  "/dichos": "Dichos Mineros",
  "/dichos-mineros": "Dichos Mineros",
  "/catalogo": "Catálogo",
  "/negocios": "Portal de Negocios",
  "/apoya": "Apoya RDM",
};

export default function MicroPageIntro() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const label = useMemo(() => ROUTE_LABELS[location.pathname] ?? "Real del Monte Explorer", [location.pathname]);

  useEffect(() => {
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none fixed left-1/2 top-20 z-[60] w-[92vw] max-w-md -translate-x-1/2"
        >
          <div className="glass-dark rounded-2xl border border-white/15 px-4 py-3 shadow-elevated backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Micro presentación</p>
                <p className="truncate font-serif text-base text-white">{label}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
