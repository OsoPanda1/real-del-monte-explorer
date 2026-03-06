// Librerías externas
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Componentes principales
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

// Componentes de contenido
import PostCard from "@/components/PostCard";
import HeroSection from "@/components/HeroSection";
import RoutesSection from "@/components/RoutesSection";
import VideoGallery from "@/components/VideoGallery";
import ImageGallery from "@/components/ImageGallery";

// Efectos visuales
import { TextReveal, StaggerContainer, StaggerItem, GlowCard } from "@/components/VisualEffects";
import GradientSeparator from "@/components/GradientSeparator";

// Assets
import pasteImg from "@/assets/paste.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import minaImg from "@/assets/mina-acosta.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";

// Componente principal
const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <PageTransition>
      <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <HeroSection />

        {/* Sección Lugares */}
        <section className="py-24 relative overflow-hidden">
          <motion.div className="absolute inset-0 -z-10" style={{ y: backgroundY }}>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-5"
              style={{ backgroundImage: `url(${heroImg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </motion.div>

          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <h2 className="text-4xl font-bold">Lugares Imperdibles</h2>
              <p className="text-muted">Descubre los atractivos más emblemáticos de Real del Monte</p>
            </TextReveal>
            {/* Aquí se renderizan PlaceCards dinámicos */}
          </div>
        </section>

        <GradientSeparator />
        <RoutesSection />
        <GradientSeparator />
        <VideoGallery />
        <GradientSeparator />
        <ImageGallery />
        <GradientSeparator />

        {/* Muro de recuerdos */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <TextReveal>
              <h2 className="text-4xl font-bold">Muro de Recuerdos</h2>
              <p className="text-muted">Experiencias compartidas por visitantes</p>
            </TextReveal>
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StaggerItem>
                <GlowCard>
                  <PostCard
                    userName="Ejemplo"
                    content="Texto de prueba"
                    image={minaImg}
                  />
                </GlowCard>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
