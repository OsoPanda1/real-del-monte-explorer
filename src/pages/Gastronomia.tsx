import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Utensils, ChefHat, Coffee, Star, Clock, MapPin, 
  Flame, Sparkles, Navigation
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SectionHeader from "@/components/SectionHeader";
import LiveEventBadge from "@/components/LiveEventBadge";
import pasteImg from "@/assets/paste.webp";

interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  address?: string;
  phone?: string;
  imageUrl?: string;
  isPremium: boolean;
}

interface ContentRecommendation {
  id: string;
  business: Business;
  reason?: string;
}

interface ContentBlock {
  id: string;
  title: string;
  subtitle?: string;
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
  business?: Business | null;
}

interface ExploreData {
  section: {
    id: string;
    title: string;
    description?: string;
    blocks: ContentBlock[];
  } | null;
  routes: any[];
  businesses: Business[];
  liveEvents: LiveEvent[];
}

const pasteTypes = [
  {
    name: "Paste de Papa con Carne",
    origin: "Receta Original Cornish",
    description: "El clásico tradicional. Carne de res sazonada con especias, papas cortadas en cubos y un toque de pimienta negra, envuelto en masa hojaldre dorada.",
    isTraditional: true,
    rating: 4.9
  },
  {
    name: "Paste de Mole",
    origin: "Fusión Mexicano-Cornish",
    description: "Pollo desmenuzado bañado en mole poblano tradicional, una creación única que solo existe en Real del Monte.",
    isTraditional: false,
    rating: 4.8
  },
  {
    name: "Paste de Frijol con Queso",
    origin: "Tradición Local",
    description: "Frijoles bayos refritos con queso fresco, una opción vegetariana que rinde homenaje a los ingredientes mexicanos.",
    isTraditional: false,
    rating: 4.7
  },
  {
    name: "Paste de Pollo con Chipotle",
    origin: "Creación Contemporánea",
    description: "Pollo jugoso con salsa de chipotle ahumado, perfecto equilibrio entre picante y sabor.",
    isTraditional: false,
    rating: 4.6
  },
  {
    name: "Paste de Atún",
    origin: "Receta de los Mineros",
    description: "Atún con aceitunas, cebolla y pimiento, tradición que traían los ingleses de sus viajes marítimos.",
    isTraditional: true,
    rating: 4.5
  },
  {
    name: "Paste Dulce de Piña",
    origin: "Tradición Postrera",
    description: "Dulce de piña casero envuelto en masa, el favorito de los niños y perfecto para el café de la tarde.",
    isTraditional: false,
    rating: 4.8
  }
];

const GastronomiaPage = () => {
  const [data, setData] = useState<ExploreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Try to get user location for nearby events
    const fetchData = async (lat?: number, lon?: number) => {
      try {
        const params = lat && lon ? `?lat=${lat}&lon=${lon}` : "";
        const response = await fetch(`/api/explore/theme/gastronomia${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching gastronomia data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchData(latitude, longitude);
        },
        () => {
          fetchData();
        }
      );
    } else {
      fetchData();
    }
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-night-900 via-night-800 to-night-900">
        <Navbar />
        
        {/* Hero - New elegant design */}
        <section className="relative min-h-[70vh] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${pasteImg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-night-900/70 via-night-800/60 to-night-900" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,178,106,0.2),transparent_50%)]" />
          </div>

          <div className="relative flex min-h-[70vh] items-end pb-20 pt-32">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-2 backdrop-blur-sm">
                  <Utensils className="h-4 w-4 text-gold-400" />
                  <span className="text-xs uppercase tracking-[0.25em] text-gold-400">
                    Cuna del Paste en México
                  </span>
                </div>

                <h1 className="mb-6 font-serif text-5xl leading-tight text-silver-300 md:text-6xl lg:text-7xl">
                  Gastronomía de 
                  <span className="block text-gold-400">Real del Monte</span>
                </h1>

                <p className="max-w-2xl text-base leading-relaxed text-silver-400 md:text-lg">
                  Sabores calientes en un pueblo frío: pastes humeantes, pan recién salido del horno 
                  y mesas que se abren para quien llega. La única fusión cornish-mexicana del mundo.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Live Events Section */}
        {!loading && data?.liveEvents && data.liveEvents.length > 0 && (
          <section className="border-b border-white/5 bg-night-800/50 py-8">
            <div className="container mx-auto px-4 md:px-8">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                  </span>
                  <h2 className="text-xs uppercase tracking-[0.3em] text-gold-400">
                    Hoy cerca de ti
                  </h2>
                </div>
                {location && (
                  <span className="text-[10px] text-silver-500">
                    Usando tu ubicación
                  </span>
                )}
              </div>
              <div className="scrollbar-thin scrollbar-thumb-gold-400/20 flex gap-4 overflow-x-auto pb-2">
                {data.liveEvents.map((event) => (
                  <LiveEventBadge key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Narrative Blocks from API */}
        {data?.section?.blocks && data.section.blocks.length > 0 ? (
          <section className="py-20">
            <div className="container mx-auto max-w-4xl px-4 md:px-8">
              <div className="space-y-12">
                {data.section.blocks.map((block, index) => (
                  <motion.article
                    key={block.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10"
                  >
                    {/* Decorative gradient */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl" />
                    
                    <header className="relative mb-6">
                      <h2 className="font-serif text-2xl text-silver-300 md:text-3xl">
                        {block.title}
                      </h2>
                      {block.subtitle && (
                        <p className="mt-2 text-sm text-silver-500">
                          {block.subtitle}
                        </p>
                      )}
                    </header>

                    <p className="relative whitespace-pre-line text-sm leading-relaxed text-silver-400/95">
                      {block.body}
                    </p>

                    {/* Recommendations */}
                    {block.recommendations.length > 0 && (
                      <section className="relative mt-8 border-t border-white/10 pt-6">
                        <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-silver-500">
                          Lugares donde este capítulo se vuelve real
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                          {block.recommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className="group rounded-2xl border border-white/10 bg-night-900/60 p-4 transition-colors hover:border-gold-400/50"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-silver-300 group-hover:text-gold-400 transition-colors">
                                    {rec.business.name}
                                  </h3>
                                  <p className="text-xs text-silver-500">
                                    {rec.business.category}
                                  </p>
                                </div>
                                {rec.business.isPremium && (
                                  <Sparkles className="h-4 w-4 text-gold-400" />
                                )}
                              </div>
                              {rec.reason && (
                                <p className="mt-2 text-xs text-silver-500 italic">
                                  &ldquo;{rec.reason}&rdquo;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        ) : (
          /* Fallback: History of Paste (when no API data) */
          <section className="py-20">
            <div className="container mx-auto px-4 md:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="mb-6 font-serif text-3xl text-silver-300 md:text-4xl">
                    La Historia del Paste
                  </h2>
                  <div className="space-y-4 text-sm leading-relaxed text-silver-400">
                    <p>
                      Cuando los mineros de Cornualles, Inglaterra llegaron a Real del Monte en 1824, 
                      trajeron consigo una tradición gastronómica que cambiaría para siempre la cultura 
                      culinaria de la región: el <strong className="text-gold-400">Cornish Pasty</strong>.
                    </p>
                    <p>
                      Originalmente, el paste era la comida de trabajo perfecta para los mineros. Su 
                      característica forma de media luna con un grueso borde de masa permitía que los 
                      trabajadores sostuvieran su almuerzo con manos sucias de carbón y lo descartaran 
                      después, protegiendo el contenido de contaminación.
                    </p>
                    <p>
                      Con el tiempo, las familias mexicanas comenzaron a fusionar la receta original con 
                      ingredientes locales. Así nacieron versiones con mole, frijoles, chile y otros 
                      sabores típicamente mexicanos, creando un platillo único en el mundo que solo 
                      existe en Real del Monte.
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-gold-400/20 bg-gold-400/5 p-4 text-center">
                      <div className="font-serif text-2xl text-gold-400">200+</div>
                      <div className="text-[10px] uppercase tracking-wider text-silver-500">Años de historia</div>
                    </div>
                    <div className="rounded-xl border border-gold-400/20 bg-gold-400/5 p-4 text-center">
                      <div className="font-serif text-2xl text-gold-400">50+</div>
                      <div className="text-[10px] uppercase tracking-wider text-silver-500">Variedades</div>
                    </div>
                    <div className="rounded-xl border border-gold-400/20 bg-gold-400/5 p-4 text-center">
                      <div className="font-serif text-2xl text-gold-400">15</div>
                      <div className="text-[10px] uppercase tracking-wider text-silver-500">Pastelerías</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
                    <img 
                      src={pasteImg}
                      alt="Paste tradicional de Real del Monte"
                      className="w-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night-900/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-white/10 bg-night-800/90 p-4 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-2 text-gold-400 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">Dato Curioso</span>
                    </div>
                    <p className="max-w-[200px] text-xs text-silver-400">
                      El Museo del Paste en Real del Monte es el único en el mundo dedicado a esta delicia.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* Paste Types Grid */}
        <section className="border-y border-white/5 bg-night-800/30 py-20">
          <div className="container mx-auto px-4 md:px-8">
            <SectionHeader
              title="Variedades de Paste"
              subtitle="Desde la receta original cornish hasta creaciones únicas de fusión mexicana"
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pasteTypes.map((paste, index) => (
                <motion.div
                  key={paste.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all hover:border-gold-400/30 hover:bg-white/[0.05]"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-silver-300 group-hover:text-gold-400 transition-colors">
                        {paste.name}
                      </h3>
                      <span className={`mt-1 inline-block text-[10px] uppercase tracking-wider ${
                        paste.isTraditional 
                          ? "text-gold-400" 
                          : "text-silver-500"
                      }`}>
                        {paste.origin}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gold-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-sm">{paste.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-silver-500">
                    {paste.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Businesses from API or Fallback */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <SectionHeader
              title="Dónde Comer"
              subtitle="Los mejores lugares para disfrutar la gastronomía local"
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {(data?.businesses || []).slice(0, 6).map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-gold-400/30"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-silver-300 group-hover:text-gold-400 transition-colors">
                        {business.name}
                      </h3>
                      <span className="text-sm text-silver-500">{business.category}</span>
                    </div>
                    {business.isPremium && (
                      <Sparkles className="h-5 w-5 text-gold-400" />
                    )}
                  </div>

                  <p className="mb-4 text-sm text-silver-400">
                    {business.description}
                  </p>

                  <div className="space-y-2">
                    {business.address && (
                      <div className="flex items-center gap-2 text-sm text-silver-500">
                        <MapPin className="h-4 w-4 text-gold-400/60" />
                        <span>{business.address}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center gap-2 text-sm text-silver-500">
                        <Navigation className="h-4 w-4 text-gold-400/60" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {(!data?.businesses || data.businesses.length === 0) && (
              <div className="mt-12 text-center text-silver-500">
                <p>Próximamente: descubre los mejores restaurantes y pastelerías de Real del Monte</p>
              </div>
            )}
          </div>
        </section>

        {/* Routes Section */}
        {data?.routes && data.routes.length > 0 && (
          <section className="border-t border-white/5 bg-night-800/30 py-20">
            <div className="container mx-auto px-4 md:px-8">
              <SectionHeader
                title="Rutas Gastronómicas"
                subtitle="Recorridos diseñados para saborear lo mejor del pueblo"
              />

              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.routes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                  >
                    <h3 className="mb-2 font-serif text-xl text-silver-300">{route.name}</h3>
                    <p className="mb-4 text-sm text-silver-500">{route.description}</p>
                    <div className="flex items-center gap-4 text-xs text-silver-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {route.stops?.length || 0} paradas
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,178,106,0.1),transparent_70%)]" />
          <div className="container relative mx-auto px-4 text-center md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Flame className="mx-auto mb-6 h-12 w-12 text-gold-400" />
              <h2 className="mb-4 font-serif text-3xl text-silver-300 md:text-4xl">
                ¿Tienes hambre de aventura?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-silver-500">
                Pregunta a REALITO por recomendaciones personalizadas basadas en tu ubicación 
                y descubre los secretos culinarios del pueblo.
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default GastronomiaPage;
