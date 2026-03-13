import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChefHat, Clock, Sparkles, Utensils } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import LiveEventBadge from "@/components/LiveEventBadge";
import pasteImg from "@/assets/paste.webp";

interface Business {
  id: string;
  name: string;
  category: string;
}

interface ContentRecommendation {
  id: string;
  business: Business;
  reason?: string;
}

interface ContentBlock {
  id: string;
  title: string;
  body: string;
  recommendations: ContentRecommendation[];
}

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt: string;
  distanceKm?: number | null;
}

interface ExploreData {
  section: {
    id: string;
    title: string;
    description?: string;
    blocks: ContentBlock[];
  } | null;
  liveEvents: LiveEvent[];
}

export default function GastronomiaPage() {
  const [data, setData] = useState<ExploreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/explore/theme/gastronomia");
        if (!response.ok) return;
        const payload = (await response.json()) as ExploreData;
        setData(payload);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-night-900 via-night-800 to-night-900 text-silver-200">
        <Navbar />

        <section className="relative overflow-hidden pb-20 pt-36">
          <img src={pasteImg} alt="Pastes tradicionales" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-night-900/70 via-night-800/75 to-night-900" />

          <div className="relative container mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs uppercase tracking-widest text-gold-300">
                <Utensils className="h-3.5 w-3.5" /> Ruta gastronómica
              </span>
              <h1 className="mt-4 font-serif text-4xl text-silver-100 md:text-6xl">Gastronomía de Real del Monte</h1>
              <p className="mt-4 text-silver-400">
                Sabores de mina, tradición inglesa y creatividad hidalguense: del paste clásico a la cocina de altura.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto space-y-8 px-4 pb-24 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <ChefHat className="mb-2 h-5 w-5 text-gold-400" />
              <p className="text-sm text-silver-300">Recetas con herencia minera y técnicas contemporáneas.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Clock className="mb-2 h-5 w-5 text-gold-400" />
              <p className="text-sm text-silver-300">Experiencias breves de 30 a 90 minutos para cada visita.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Sparkles className="mb-2 h-5 w-5 text-gold-400" />
              <p className="text-sm text-silver-300">Contenido curado desde el endpoint temático de explore.</p>
            </div>
          </div>

          {!loading && data?.liveEvents?.length ? (
            <div className="space-y-3">
              <h2 className="font-serif text-2xl text-silver-100">Eventos gastronómicos en vivo</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {data.liveEvents.map((event) => (
                  <LiveEventBadge key={event.id} event={event} />
                ))}
              </div>
            </div>
          ) : null}

          {data?.section?.blocks?.length ? (
            <div className="space-y-5">
              {data.section.blocks.map((block) => (
                <article key={block.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="font-serif text-2xl text-silver-200">{block.title}</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-silver-400">{block.body}</p>

                  {block.recommendations.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {block.recommendations.map((rec) => (
                        <span key={rec.id} className="rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs text-gold-200">
                          {rec.business.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-silver-400">
              {loading ? "Cargando contenido gastronómico..." : "Aún no hay bloques de contenido configurados para gastronomía."}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
