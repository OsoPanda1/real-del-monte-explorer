import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import PageTransition from "@/components/PageTransition";
import GradientSeparator from "@/components/GradientSeparator";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { AuroraBackground, TextReveal } from "@/components/VisualEffects";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-real-del-monte.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";

const events = [
  { name: "Festival Internacional del Paste", date: "12 Oct", time: "10:00 - 20:00", location: "Plaza Principal", description: "El festival gastronomico mas importante con mas de 50 variedades de pastes.", image: rdm1, category: "Gastronomia" },
  { name: "Dia de Muertos en Real del Monte", date: "01 Nov", time: "18:00 - 23:00", location: "Panteon Ingles", description: "Celebracion unica que fusiona tradiciones mexicanas e inglesas.", image: rdm2, category: "Cultural" },
  { name: "Carrera de Montana RDM", date: "25 Nov", time: "07:00 - 14:00", location: "Penas Cargadas", description: "Trail running por bosques y formaciones rocosas.", image: rdm3, category: "Deportivo" },
  { name: "Feria del Libro en la Montana", date: "08 Dic", time: "09:00 - 18:00", location: "Casa de Cultura", description: "Encuentro literario con autores locales y nacionales.", image: heroImg, category: "Cultural" },
  { name: "Noche de Leyendas", date: "20 Dic", time: "20:00 - 23:00", location: "Centro Historico", description: "Recorrido nocturno narrando las leyendas mas famosas del pueblo.", image: rdm1, category: "Cultural" },
  { name: "Ano Nuevo en la Montana", date: "31 Dic", time: "21:00 - 01:00", location: "Plaza Principal", description: "Celebracion comunitaria de fin de ano con musica en vivo.", image: rdm2, category: "Festividad" },
];

const eventCategories = ["Todos", "Cultural", "Gastronomia", "Deportivo", "Festividad"];

const EventosPage = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredEvents = useMemo(() => {
    if (activeCategory === "Todos") return events;
    return events.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-night-900 text-silver-300">
        <SEOMeta {...PAGE_SEO.eventos} />
        <Navbar />

        {/* Immersive Hero */}
        <section className="relative overflow-hidden pt-24 pb-16">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 ken-burns" style={{ backgroundImage: `url(${heroImg})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-night-900/80 via-night-900/70 to-night-900" />
          <AuroraBackground />
          <div className="dust-particles" />

          <div className="relative mx-auto max-w-6xl px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] backdrop-blur-sm">
                <Calendar className="h-3.5 w-3.5 text-gold-400" />
                <span>Calendario de Eventos</span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-tight">
                <span className="block">Eventos y</span>
                <span
                  className="block animate-gradient-text text-glow-gold"
                  style={{
                    backgroundImage: "linear-gradient(135deg, hsl(43,80%,55%) 0%, hsl(35,70%,65%) 25%, hsl(43,80%,55%) 50%, hsl(25,60%,50%) 75%, hsl(43,80%,55%) 100%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Festivales
                </span>
              </h1>
              <p className="max-w-2xl text-base text-silver-400 md:text-lg leading-relaxed">
                Calendario de actividades culturales, festivales y temporadas especiales en Real del Monte.
              </p>
            </motion.div>
          </div>
        </section>

        <GradientSeparator animated />

        {/* Category Filters */}
        <section className="relative py-8">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {eventCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-gold-400/20 text-gold-400 border border-gold-400/30"
                      : "border border-white/10 bg-white/5 text-silver-400 hover:bg-white/10 hover:text-silver-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex items-center gap-2 mb-6 text-sm text-silver-500">
            <Sparkles className="h-3.5 w-3.5 text-gold-400/60" />
            <span>{filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5">
              <Calendar className="h-12 w-12 text-silver-500 mx-auto mb-4" />
              <p className="text-silver-400 text-lg">No hay eventos en esta categoria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((event, i) => (
                <EventCard key={event.name} {...event} index={i} />
              ))}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default EventosPage;
