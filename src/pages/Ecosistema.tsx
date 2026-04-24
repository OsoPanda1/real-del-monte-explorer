import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Network, Compass, Link2, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOMeta from "@/components/SEOMeta";
import Constellation from "@/components/ecosystem/Constellation";
import NodeGrid from "@/components/ecosystem/NodeGrid";
import NodeDetail from "@/components/ecosystem/NodeDetail";
import PortalsPanel from "@/components/ecosystem/PortalsPanel";
import { useEcosystem } from "@/hooks/useEcosystem";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type CategoryId,
  type EcosystemNode,
} from "@/data/ecosystem-types";

type ViewMode = "constellation" | "nodes" | "portals";

export default function Ecosistema() {
  const { data, loading, error } = useEcosystem();
  const [view, setView] = useState<ViewMode>("constellation");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [selected, setSelected] = useState<EcosystemNode | null>(null);

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.nodes.filter((n) => {
      if (activeCategory && n.category !== activeCategory) return false;
      if (!q) return true;
      return (
        n.name.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.topics.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [data, query, activeCategory]);

  return (
    <main className="min-h-screen" style={{ background: "hsl(220,50%,4%)" }}>
      <SEOMeta
        title="Ecosistema | RDM Digital × TAMV Online"
        description="Hub federado del ecosistema TAMV y Real del Monte Digital. Constelación de 200 repositorios, portales abiertos e identidad pública conectada a ORCID, Zenodo, AVIXA y más."
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-10 md:pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[11px] tracking-[0.2em] uppercase"
              style={{
                background: "hsla(210,100%,55%,0.1)",
                border: "1px solid hsla(210,100%,55%,0.2)",
                color: "hsl(210,100%,75%)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ecosistema Civilizatorio Federado
            </div>
            <h1
              className="font-serif text-4xl md:text-6xl font-bold leading-[1.05] text-balance mb-6"
              style={{ color: "hsl(0,0%,95%)" }}
            >
              Un nodo. Doscientas raíces.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, hsl(210,100%,65%), hsl(43,90%,65%))",
                }}
              >
                Una sola visión.
              </span>
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed text-pretty max-w-2xl"
              style={{ color: "hsla(0,0%,100%,0.7)" }}
            >
              RDM Digital es el nodo raíz del ecosistema TAMV: una red federada donde cada
              repositorio, comunidad y portal externo conserva su autonomía pero comparte un
              mismo linaje. Aquí puedes explorar la constelación viva que conecta el
              Pueblo Mágico con la identidad pública del proyecto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats + view switcher */}
      <section className="pb-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <StatsStrip loading={loading} data={data} />
            <div
              className="inline-flex p-1 rounded-xl self-start"
              style={{ background: "hsl(220,45%,8%)", border: "1px solid hsla(0,0%,100%,0.08)" }}
            >
              <ViewButton active={view === "constellation"} onClick={() => setView("constellation")} icon={<Network className="w-4 h-4" />} label="Constelación" />
              <ViewButton active={view === "nodes"} onClick={() => setView("nodes")} icon={<Compass className="w-4 h-4" />} label="Nodos" />
              <ViewButton active={view === "portals"} onClick={() => setView("portals")} icon={<Link2 className="w-4 h-4" />} label="Puertas" />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-8 space-y-8">
          {view !== "portals" && (
            <>
              <div className="flex flex-col md:flex-row gap-3">
                <label className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "hsla(0,0%,100%,0.4)" }}
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar nodos por nombre, descripción o tópico..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-colors"
                    style={{
                      background: "hsl(220,45%,8%)",
                      border: "1px solid hsla(0,0%,100%,0.1)",
                      color: "hsl(0,0%,95%)",
                    }}
                  />
                </label>
              </div>

              <CategoryFilter
                data={data}
                active={activeCategory}
                onChange={setActiveCategory}
              />
            </>
          )}

          {loading && <LoadingState />}
          {error && !loading && <ErrorState error={error} />}

          {!loading && !error && data && (
            <>
              {view === "constellation" && (
                <Constellation
                  graph={{ ...data, nodes: filteredNodes, edges: data.edges }}
                  onSelect={setSelected}
                  activeCategory={activeCategory}
                />
              )}
              {view === "nodes" && <NodeGrid nodes={filteredNodes} onSelect={setSelected} />}
              {view === "portals" && <PortalsPanel />}
            </>
          )}
        </div>
      </section>

      <NodeDetail node={selected} onClose={() => setSelected(null)} />
      <Footer />
    </main>
  );
}

/* ------ subcomponents ------ */

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all"
      style={{
        background: active
          ? "linear-gradient(135deg, hsl(210,100%,55%), hsl(210,100%,45%))"
          : "transparent",
        color: active ? "#fff" : "hsla(0,0%,100%,0.6)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function StatsStrip({ loading, data }: { loading: boolean; data: ReturnType<typeof useEcosystem>["data"] }) {
  const total = data?.total ?? 0;
  const tamv = data?.counts.tamv ?? 0;
  const rdm = data?.counts.rdm ?? 0;
  const ai = data?.counts.ai ?? 0;
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <Stat label="Nodos totales" value={loading ? "—" : String(total)} accent="hsl(210,100%,55%)" />
      <Stat label="TAMV Core" value={loading ? "—" : String(tamv)} accent="hsl(210,100%,55%)" />
      <Stat label="Real del Monte" value={loading ? "—" : String(rdm)} accent="hsl(43,80%,55%)" />
      <Stat label="IA & Agentes" value={loading ? "—" : String(ai)} accent="hsl(280,70%,65%)" />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-xl px-4 py-2.5"
      style={{
        background: "hsl(220,45%,8%)",
        border: `1px solid ${accent}33`,
      }}
    >
      <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: accent }}>
        {label}
      </div>
      <div className="text-lg font-semibold leading-tight" style={{ color: "hsl(0,0%,95%)" }}>
        {value}
      </div>
    </div>
  );
}

function CategoryFilter({
  data,
  active,
  onChange,
}: {
  data: ReturnType<typeof useEcosystem>["data"];
  active: CategoryId | null;
  onChange: (c: CategoryId | null) => void;
}) {
  if (!data) return null;
  const available = CATEGORY_ORDER.filter((c) => (data.counts[c] ?? 0) > 0);
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        style={{
          background: active === null ? "hsla(0,0%,100%,0.1)" : "transparent",
          color: active === null ? "hsl(0,0%,95%)" : "hsla(0,0%,100%,0.5)",
          border: "1px solid hsla(0,0%,100%,0.1)",
        }}
      >
        Todos · {data.total}
      </button>
      {available.map((c) => {
        const meta = CATEGORY_META[c];
        const count = data.counts[c];
        const isActive = active === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(isActive ? null : c)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: isActive ? `${meta.color}22` : "transparent",
              color: isActive ? "hsl(0,0%,95%)" : "hsla(0,0%,100%,0.5)",
              border: `1px solid ${isActive ? meta.color : "hsla(0,0%,100%,0.1)"}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
              aria-hidden
            />
            {meta.label} · {count}
          </button>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="rounded-2xl p-10 text-center animate-pulse"
      style={{
        background: "hsl(220,45%,8%)",
        border: "1px solid hsla(210,100%,55%,0.15)",
        color: "hsla(0,0%,100%,0.55)",
      }}
    >
      Invocando el ecosistema desde GitHub…
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div
      className="rounded-2xl p-6 flex items-start gap-4"
      style={{
        background: "hsla(0,70%,45%,0.08)",
        border: "1px solid hsla(0,70%,55%,0.3)",
        color: "hsl(0,0%,95%)",
      }}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "hsl(0,70%,65%)" }} />
      <div>
        <div className="font-semibold">No pudimos sincronizar el ecosistema</div>
        <p className="text-sm mt-1" style={{ color: "hsla(0,0%,100%,0.7)" }}>
          {error}
        </p>
        <p className="text-xs mt-2" style={{ color: "hsla(0,0%,100%,0.5)" }}>
          Verifica que la Edge Function <code>ecosystem-sync</code> esté desplegada y que, si usas
          un token de GitHub, la variable <code>GITHUB_TOKEN</code> esté configurada en Supabase.
        </p>
      </div>
    </div>
  );
}
