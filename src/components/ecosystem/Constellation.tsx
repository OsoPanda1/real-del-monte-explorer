import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { CATEGORY_META } from "@/data/ecosystem-types";
import type { EcosystemGraph, EcosystemNode } from "@/data/ecosystem-types";

interface Props {
  graph: EcosystemGraph;
  onSelect: (node: EcosystemNode) => void;
  activeCategory: string | null;
}

type GraphDatum = EcosystemNode & { val: number; color: string };

export default function Constellation({ graph, onSelect, activeCategory }: Props) {
  const ref = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 560 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: Math.max(320, rect.width), height: Math.max(400, rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    const nodes: GraphDatum[] = graph.nodes.map((n) => ({
      ...n,
      val: 1 + Math.log2(1 + n.stars) + (n.category === "tamv" || n.category === "rdm" ? 4 : 0),
      color: CATEGORY_META[n.category].color,
    }));
    const ids = new Set(nodes.map((n) => n.id));
    const links = graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { nodes, links };
  }, [graph]);

  useEffect(() => {
    const inst = ref.current;
    if (!inst) return;
    const timer = setTimeout(() => inst.zoomToFit(400, 40), 600);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[560px] rounded-2xl overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(220,45%,8%) 0%, hsl(220,50%,4%) 100%)",
        border: "1px solid hsla(210,100%,55%,0.15)",
      }}
    >
      <ForceGraph2D
        ref={ref}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)"
        cooldownTicks={120}
        linkColor={() => "hsla(210, 50%, 70%, 0.15)"}
        linkWidth={0.6}
        nodeRelSize={3}
        nodeVal={(n) => (n as GraphDatum).val}
        nodeLabel={(n) => {
          const d = n as GraphDatum;
          const meta = CATEGORY_META[d.category];
          return `<div style="font-family:ui-sans-serif,system-ui;padding:6px 8px;border-radius:8px;background:hsl(220,45%,10%);color:#fff;border:1px solid ${meta.color}55;max-width:260px"><strong>${d.name}</strong><br/><span style='color:${meta.color};font-size:11px;text-transform:uppercase;letter-spacing:0.08em'>${meta.label}</span><br/><span style='font-size:11px;color:#fff9'>${d.description || "Sin descripción"}</span></div>`;
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const d = node as GraphDatum & { x?: number; y?: number };
          const x = d.x ?? 0;
          const y = d.y ?? 0;
          const dim =
            activeCategory && activeCategory !== d.category ? 0.18 : 1;
          const radius = Math.max(2.5, 2 + Math.sqrt(d.val) * 1.4);

          // Glow
          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
          glow.addColorStop(0, `${d.color}${Math.round(dim * 160).toString(16).padStart(2, "0")}`);
          glow.addColorStop(1, `${d.color}00`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 3, 0, 2 * Math.PI);
          ctx.fill();

          // Core dot
          ctx.fillStyle = d.color;
          ctx.globalAlpha = dim;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.globalAlpha = 1;

          // Label for important nodes
          if (globalScale > 1.4 || d.val > 5) {
            ctx.font = `${11 / globalScale}px ui-sans-serif, system-ui`;
            ctx.fillStyle = `rgba(255,255,255,${0.85 * dim})`;
            ctx.textAlign = "center";
            ctx.fillText(d.name, x, y + radius + 10 / globalScale);
          }
        }}
        onNodeClick={(node) => onSelect(node as GraphDatum)}
      />
      <div
        className="pointer-events-none absolute bottom-3 left-3 text-[10px] tracking-widest uppercase"
        style={{ color: "hsla(0,0%,100%,0.4)" }}
      >
        Constelación TAMV · RDM · {graph.total} nodos
      </div>
    </div>
  );
}
