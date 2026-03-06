import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import SectionHeader from "@/components/SectionHeader";
import PlaceCard from "@/components/PlaceCard";
import BusinessCard from "@/components/BusinessCard";
import PostCard from "@/components/PostCard";
import EventCard from "@/components/EventCard";
import RoutesSection from "@/components/RoutesSection";
import VideoGallery from "@/components/VideoGallery";
import ImageGallery from "@/components/ImageGallery";
import { TextReveal, StaggerContainer, StaggerItem, GlowCard } from "@/components/VisualEffects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GradientSeparator from "@/components/GradientSeparator";
import PageTransition from "@/components/PageTransition";

// API Hooks
import { usePlaces } from "@/features/places";
import { useBusinesses } from "@/features/businesses";
import { useEvents } from "@/features/events";
import { useCommunityPosts } from "@/lib/hooks";

// Assets
import pasteImg from "@/assets/paste.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import minaImg from "@/assets/mina-acosta.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";
import rdm4 from "@/assets/rdm02.jpg";

// Default fallback images for API data
const defaultImages = [pasteImg, panteonImg, minaImg, penasImg, callesImg, rdm1, rdm2, rdm3, rdm4];

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // API Data Hooks
  const { data: placesData, isLoading: placesLoading } = usePlaces({ limit: 6 });
  const { data: businessesData, isLoading: businessesLoading } = useBusinesses({ limit: 6 });
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ limit: 4 });
  const { data: postsData, isLoading: postsLoading } = useCommunityPosts({ limit: 4 });

  // Helper to get image - API or fallback
  const getImage = (imgUrl?: string, index: number = 0) => imgUrl || defaultImages[index % defaultImages.length];

  return (
    <PageTransition>
      <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <HeroSection />

        {/* Places Section with Parallax Background */}
        <section className="py-24 relative overflow-hidden">
          {/* Animated Background */}
          <motion.div 
            className="absolute inset-0 -z-10"
            style={{ y: backgroundY }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-5"
              style={{ backgroundImage: `url(${heroImg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </motion.div>

          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <SectionHeader 
                title="Lugares Imperdibles" 
                subtitle="Descubre los atractivos más emblemáticos de Real del Monte" 
                linkTo="/lugares" 
              />
            </TextReveal>
            
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(placesData || []).map((place, i) => (
                <StaggerItem key={place.id || place.name}>
                  <GlowCard>
                    <PlaceCard {...place} index={i} />
                  </GlowCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8">
          <GradientSeparator />
        </div>

        {/* Routes Section */}
        <RoutesSection />

        <div className="container mx-auto px-4 md:px-8">
          <GradientSeparator />
        </div>

        {/* Video Gallery - 6 videos */}
        <VideoGallery />

        <div className="container mx-auto px-4 md:px-8">
          <GradientSeparator />
        </div>

        {/* Directory Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <SectionHeader 
                title="Directorio Local" 
                subtitle="Negocios y servicios recomendados por la comunidad" 
                linkTo="/directorio" 
              />
            </TextReveal>
            
            <StaggerContainer className="grid md:grid-cols-2 gap-6">
              {(businessesData || []).map((biz, i) => (
                <StaggerItem key={biz.id || biz.name}>
                  <GlowCard>
                    <BusinessCard {...biz} index={i} />
                  </GlowCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8">
          <GradientSeparator />
        </div>

        {/* Image Gallery - 25 images */}
        <ImageGallery />

        <div className="container mx-auto px-4 md:px-8">
          <GradientSeparator />
        </div>

        {/* Events Section */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[hsl(43,65%,52%)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(18,45%,48%)]/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <TextReveal>
              <SectionHeader 
                title="Próximos Eventos" 
                subtitle="Festivales, ferias y temporadas especiales" 
                linkTo="/eventos" 
              />
            </TextReveal>
            
            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {(eventsData || []).map((event, i) => (
                <StaggerItem key={event.id || event.name}>
                  <EventCard {...event} index={i} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Community Feed */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <SectionHeader 
                title="Muro de Recuerdos" 
                subtitle="Experiencias compartidas por visitantes de Real del Monte" 
                linkTo="/comunidad" 
              />
            </TextReveal>
            
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(postsData || []).map((post, i) => (
                <StaggerItem key={post.id || post.userName}>
                  <PostCard {...post} index={i} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8">
          <GradientSeparator />
        </div>

        {/* Premium CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <img 
              src={callesImg} 
              alt="Real del Monte" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(24,15%,15%)]/95 via-[hsl(24,15%,15%)]/80 to-[hsl(24,15%,15%)]/60" />
          </motion.div>
          
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <motion.div 
              className="max-w-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-[hsl(43,65%,52%)]/20 text-[hsl(43,65%,52%)] text-xs font-medium mb-6">
                ¿Eres comerciante?
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Únete al directorio digital de Real del Monte
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Llega a miles de turistas que visitan nuestro Pueblo Mágico cada año. 
                Planes desde $50 MXN/mes con visibilidad premium.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-premium">
                  Registrar mi negocio
                </button>
                <button className="btn-glass text-white border-white/20 hover:bg-white/10">
                  Conocer planes
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
