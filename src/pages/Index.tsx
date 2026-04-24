import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Landmark, MapPinned, Sparkles, Clock3, Utensils, MountainSnow, BrainCircuit, Radar, RefreshCcw, ShieldCheck } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SectionHeader from "@/components/SectionHeader";
import PlaceCard from "@/components/PlaceCard";
import BusinessCard from "@/components/BusinessCard";
import PostCard from "@/components/PostCard";
import EventCard from "@/components/EventCard";
import RoutesSection from "@/components/RoutesSection";
import VideoGallery from "@/components/VideoGallery";
import ImageGallery from "@/components/ImageGallery";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import SEOMeta from "@/components/SEOMeta";
import { TextReveal, StaggerContainer, StaggerItem, GlowCard } from "@/components/VisualEffects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GradientSeparator from "@/components/GradientSeparator";
import PageTransition from "@/components/PageTransition";
import ExperienceHub from "@/components/ExperienceHub";
import MapaView from "@/components/MapaView";

import { usePlaces } from "@/features/places";
import { useBusinesses } from "@/features/businesses";
import { useCommunityPosts } from "@/lib/hooks";
import { useEvents } from "@/features/events";
import { commerceMentionPolicies, getRealtimeMapSnapshot, getRealitoKnowledgeStats, realitoKnowledgeLibrary } from "@/features/ai";

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const { data: places = [], isLoading: loadingPlaces } = usePlaces();
  const { data: businesses = [], isLoading: loadingBusinesses } = useBusinesses();
  const { data: posts = [], isLoading: loadingPosts } = useCommunityPosts();
  const { data: events = [], isLoading: loadingEvents } = useEvents();

  const explorerPillars = [
    {
      icon: Landmark,
      title: "Memoria viva y patrimonio minero",
      description: "Conecta con leyendas, arquitectura centenaria y tradiciones que siguen latiendo en cada callejón."
    },
    {
      icon: Utensils,
      title: "Experiencias gastronómicas auténticas",
      description: "Encuentra pastes, cocina hidalguense y rincones culinarios que convierten cada parada en un recuerdo."
    },
    {
      icon: MountainSnow,
      title: "Naturaleza, aventura y paisajes",
      description: "Descubre rutas para caminantes, miradores y espacios ecoturísticos para vivir Real del Monte a cielo abierto."
    }
  ];

  const journeyMoments = [
    { phase: "Antes de llegar", detail: "Planea tu visita con rutas, mapas y recomendaciones personalizadas según tu tiempo.", icon: MapPinned },
    { phase: "Durante la experiencia", detail: "Navega secciones claras para no perderte eventos, cultura local y sitios imperdibles.", icon: Clock3 },
    { phase: "Después del viaje", detail: "Comparte tus recuerdos y mantente conectado con nuevas temporadas y actividades.", icon: Sparkles }
  ];

  const [realtimeSnapshot, setRealtimeSnapshot] = useState(() => getRealtimeMapSnapshot());
  useEffect(() => {
    const timer = setInterval(() => setRealtimeSnapshot(getRealtimeMapSnapshot()), 30000);
    return () => clearInterval(timer);
  }, []);

  const realitoStats = useMemo(() => getRealitoKnowledgeStats(), []);

  return (
    <PageTransition>
      <SEOMeta 
        title="Inicio"
        description="Descubre Real del Monte, Pueblo Mágico de Hidalgo. Guía turística digital con mapa interactivo, rutas, gastronomía y eventos culturales."
      />
      <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <HeroSection />

        <section className="py-20 relative">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">Nueva experiencia editorial</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Una interfaz pensada para inspirar tu próxima escapada</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Reorganizamos la experiencia para que explorar Real del Monte sea intuitivo, emocional y memorable: historia, cultura,
                gastronomía y aventura reunidas en una narrativa visual de nueva generación.
              </p>
            </div>

            <StaggerContainer className="mt-14 grid md:grid-cols-3 gap-6">
              {explorerPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <StaggerItem key={pillar.title}>
                    <GlowCard>
                      <article className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 h-full shadow-sm hover:shadow-lg transition-all">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-xl mb-3">{pillar.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                      </article>
                    </GlowCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
              <div className="flex-1 space-y-5">
                <Badge variant="secondary">Viaje guiado paso a paso</Badge>
                <h2 className="text-3xl md:text-4xl font-bold">Secciones mejor definidas para convertir curiosidad en acción</h2>
                <p className="text-muted-foreground text-lg">
                  Cada bloque te acompaña en el momento correcto de tu visita y te motiva a descubrir más: qué ver, qué vivir y a dónde ir después.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild>
                    <Link to="/rutas">Diseñar mi ruta ideal</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/historia">Explorar legado histórico</Link>
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {journeyMoments.map((moment) => {
                  const Icon = moment.icon;
                  return (
                    <article key={moment.phase} className="rounded-2xl bg-background border p-5 md:p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{moment.phase}</h3>
                          <p className="text-muted-foreground mt-2">{moment.detail}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>

        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8 grid xl:grid-cols-2 gap-8">
            <article className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-700/20">Mapa interactivo en tiempo real</Badge>
                  <h3 className="text-2xl md:text-3xl font-bold mt-3">Centro de pulso turístico de Real del Monte</h3>
                </div>
                <Radar className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4 bg-background">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Visitantes activos</p>
                  <p className="text-3xl font-bold mt-2">{realtimeSnapshot.activeVisitors}</p>
                </div>
                <div className="rounded-xl border p-4 bg-background">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Estado actual</p>
                  <p className="font-medium mt-2">{realtimeSnapshot.weatherNote}</p>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-background">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Zonas destacadas ahora</p>
                <div className="flex flex-wrap gap-2">
                  {realtimeSnapshot.highlightedZones.map((zone) => (
                    <Badge key={zone} variant="secondary">{zone}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">{realtimeSnapshot.recommendations[0]}</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2"><RefreshCcw className="w-3 h-3" />Actualización automática cada 30s</p>
              </div>

              <Button asChild className="w-full sm:w-auto">
                <Link to="/mapa">Abrir mapa interactivo completo</Link>
              </Button>
            </article>

            <article className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Librería especial Realito AI</Badge>
                  <h3 className="text-2xl md:text-3xl font-bold mt-3">Conocimiento turístico documentado y accionable</h3>
                </div>
                <BrainCircuit className="w-8 h-8 text-primary" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Puntos</p>
                  <p className="text-2xl font-bold">{realitoStats.points}</p>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Rutas</p>
                  <p className="text-2xl font-bold">{realitoStats.routes}</p>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Hechos</p>
                  <p className="text-2xl font-bold">{realitoStats.facts}</p>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold">{realitoStats.categories}</p>
                </div>
              </div>

              <div className="space-y-3">
                {realitoKnowledgeLibrary.routes.map((route) => (
                  <div key={route.id} className="rounded-xl border bg-background p-4">
                    <p className="font-semibold">{route.name}</p>
                    <p className="text-sm text-muted-foreground">{route.duration} · enfoque {route.focus}</p>
                  </div>
                ))}
              </div>

              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/comunidad">Preguntar a Realito AI en comunidad</Link>
              </Button>
            </article>
          </div>

          <div className="mt-8 rounded-3xl border bg-gradient-to-r from-background via-background to-primary/5 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <Badge variant="secondary" className="mb-2">Gobernanza comercial inteligente</Badge>
                <h3 className="text-2xl md:text-3xl font-bold">Reglas de menciones por zona para una experiencia justa y útil</h3>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {commerceMentionPolicies.map((policy) => (
                <div key={policy.zone} className="rounded-xl border bg-card p-4">
                  <p className="font-semibold">{policy.zone}</p>
                  <p className="text-sm text-muted-foreground mt-1">Hasta {policy.maxMentionsPerFeed} menciones por feed · enfriamiento {policy.cooldownMinutes} min.</p>
                  <p className="text-xs text-muted-foreground mt-2">{policy.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Places */}
        <section className="py-24 relative overflow-hidden">
          <motion.div className="absolute inset-0 -z-10" style={{ y: backgroundY }}>
            <div className="absolute inset-0 bg-cover bg-center opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </motion.div>
          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <SectionHeader title="Lugares Imperdibles" subtitle="Descubre los atractivos más emblemáticos de Real del Monte" linkTo="/lugares" />
            </TextReveal>
            {loadingPlaces ? (
              <LoadingSkeleton variant="card" count={4} />
            ) : (
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {places.map((place: any, i: number) => (
                  <StaggerItem key={place.id || place.name}>
                    <GlowCard><PlaceCard {...place} index={i} /></GlowCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>
        <RoutesSection />
        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>

        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <ExperienceHub />
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>

        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <MapaView />
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>
        <VideoGallery />
        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>

        {/* Businesses */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <SectionHeader title="Directorio Local" subtitle="Negocios y servicios recomendados por la comunidad" linkTo="/directorio" />
            </TextReveal>
            {loadingBusinesses ? (
              <LoadingSkeleton variant="card" count={2} />
            ) : (
              <StaggerContainer className="grid md:grid-cols-2 gap-6">
                {businesses.map((biz: any, i: number) => (
                  <StaggerItem key={biz.id || biz.name}>
                    <GlowCard><BusinessCard {...biz} index={i} /></GlowCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>
        <ImageGallery />
        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>

        {/* Events */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <TextReveal>
              <SectionHeader title="Próximos Eventos" subtitle="Festivales, ferias y temporadas especiales" linkTo="/eventos" />
            </TextReveal>
            {loadingEvents ? (
              <LoadingSkeleton variant="event" count={3} />
            ) : (
              <StaggerContainer className="grid md:grid-cols-3 gap-6">
                {events.map((event: any, i: number) => (
                  <StaggerItem key={event.id || event.name}>
                    <EventCard {...event} index={i} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>

        {/* Community */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <SectionHeader title="Muro de Recuerdos" subtitle="Experiencias compartidas por visitantes de Real del Monte" linkTo="/comunidad" />
            </TextReveal>
            {loadingPosts ? (
              <LoadingSkeleton variant="card" count={3} />
            ) : (
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: any, i: number) => (
                  <StaggerItem key={post.id || post.userName}>
                    <PostCard
                      userName={post.userName}
                      userAvatar={post.userAvatar || post.userName?.charAt(0) || '?'}
                      content={post.content}
                      image={post.imageUrl}
                      placeName={post.placeName}
                      likes={post.likes || 0}
                      comments={post.comments || 0}
                      timeAgo={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Reciente'}
                      index={i}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
