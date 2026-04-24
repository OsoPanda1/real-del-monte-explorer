import { ExternalLink, GitFork, Star, Archive } from "lucide-react";
import { CATEGORY_META } from "@/data/ecosystem-types";
import type { EcosystemNode } from "@/data/ecosystem-types";

interface Props {
  nodes: EcosystemNode[];
  onSelect: (node: EcosystemNode) => void;
}

export default function NodeGrid({ nodes, onSelect }: Props) {
  if (nodes.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{
          background: "hsl(220,45%,8%)",
          border: "1px dashed hsla(210,100%,55%,0.2)",
          color: "hsla(0,0%,100%,0.55)",
        }}
      >
        No hay nodos que coincidan con los filtros actuales.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {nodes.map((n) => {
        const meta = CATEGORY_META[n.category];
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => onSelect(n)}
            className="group text-left rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "hsl(220,45%,8%)",
              border: `1px solid ${meta.color}33`,
              boxShadow: "0 1px 0 hsla(0,0%,100%,0.02) inset",
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div
                  className="text-[10px] tracking-[0.2em] uppercase mb-1"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </div>
                <h3
                  className="font-serif text-lg font-semibold leading-tight text-pretty"
                  style={{ color: "hsl(0,0%,95%)" }}
                >
                  {n.name}
                </h3>
              </div>
              <span
                aria-hidden
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
              />
            </div>
            <p
              className="text-sm leading-relaxed line-clamp-3 min-h-[3.5rem]"
              style={{ color: "hsla(0,0%,100%,0.65)" }}
            >
              {n.description || "Sin descripción disponible."}
            </p>
            <div
              className="mt-4 flex items-center gap-4 text-xs"
              style={{ color: "hsla(0,0%,100%,0.45)" }}
            >
              {n.language && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "hsla(0,0%,100%,0.35)" }}
                  />
                  {n.language}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                {n.stars}
              </span>
              {n.fork && (
                <span className="inline-flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  fork
                </span>
              )}
              {n.archived && (
                <span className="inline-flex items-center gap-1">
                  <Archive className="w-3.5 h-3.5" />
                  archivado
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
