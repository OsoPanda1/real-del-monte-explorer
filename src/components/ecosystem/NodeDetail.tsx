import { useEffect } from "react";
import { ExternalLink, Star, GitBranch, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_META } from "@/data/ecosystem-types";
import type { EcosystemNode } from "@/data/ecosystem-types";

interface Props {
  node: EcosystemNode | null;
  onClose: () => void;
}

export default function NodeDetail({ node, onClose }: Props) {
  useEffect(() => {
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [node, onClose]);

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4"
          style={{ background: "hsla(220,50%,4%,0.7)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl rounded-2xl p-6 md:p-8 relative"
            style={{
              background: "hsl(220,45%,10%)",
              border: `1px solid ${CATEGORY_META[node.category].color}55`,
              boxShadow: "0 30px 80px -20px hsla(0,0%,0%,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/5 transition-colors"
              style={{ color: "hsla(0,0%,100%,0.6)" }}
            >
              <X className="w-4 h-4" />
            </button>
            <div
              className="text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{ color: CATEGORY_META[node.category].color }}
            >
              {CATEGORY_META[node.category].label}
            </div>
            <h2
              className="font-serif text-2xl md:text-3xl font-bold text-balance leading-tight mb-3"
              style={{ color: "hsl(0,0%,95%)" }}
            >
              {node.name}
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "hsla(0,0%,100%,0.7)" }}
            >
              {node.description || "Sin descripción. Este nodo aún no tiene resumen público en GitHub."}
            </p>

            <div
              className="grid grid-cols-3 gap-3 mb-6 text-xs"
              style={{ color: "hsla(0,0%,100%,0.6)" }}
            >
              <div className="rounded-xl p-3" style={{ background: "hsla(0,0%,100%,0.03)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-3.5 h-3.5" />
                  <span className="tracking-wider uppercase text-[10px]">Stars</span>
                </div>
                <div className="text-lg font-semibold" style={{ color: "hsl(0,0%,95%)" }}>
                  {node.stars}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "hsla(0,0%,100%,0.03)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="tracking-wider uppercase text-[10px]">Lenguaje</span>
                </div>
                <div className="text-sm font-medium" style={{ color: "hsl(0,0%,95%)" }}>
                  {node.language ?? "—"}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "hsla(0,0%,100%,0.03)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="tracking-wider uppercase text-[10px]">Push</span>
                </div>
                <div className="text-xs font-medium" style={{ color: "hsl(0,0%,95%)" }}>
                  {new Date(node.pushedAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {node.topics.length > 0 && (
              <div className="mb-6">
                <div
                  className="text-[10px] tracking-[0.2em] uppercase mb-2"
                  style={{ color: "hsla(0,0%,100%,0.5)" }}
                >
                  Tópicos
                </div>
                <div className="flex flex-wrap gap-2">
                  {node.topics.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: "hsla(210,100%,55%,0.1)",
                        color: "hsl(210,100%,70%)",
                        border: "1px solid hsla(210,100%,55%,0.2)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, hsl(210,100%,55%), hsl(210,100%,45%))",
                  color: "#fff",
                  boxShadow: "0 8px 24px -8px hsla(210,100%,55%,0.5)",
                }}
              >
                Abrir en GitHub <ExternalLink className="w-4 h-4" />
              </a>
              {node.homepage && (
                <a
                  href={node.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: "hsla(0,0%,100%,0.05)",
                    color: "hsl(0,0%,95%)",
                    border: "1px solid hsla(0,0%,100%,0.1)",
                  }}
                >
                  Sitio activo <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
