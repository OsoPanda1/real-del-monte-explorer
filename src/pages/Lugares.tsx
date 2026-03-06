import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlaceCard from "@/components/PlaceCard";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

// API Hooks
import { usePlaces } from "@/features/places";

// Fallback images
import pasteImg from "@/assets/paste.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import minaImg from "@/assets/mina-acosta.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";

const defaultImages = [pasteImg, panteonImg, minaImg, penasImg, callesImg, heroImg, rdm1, rdm2];

const LugaresPage = () => {
  // API Data
  const { data: places, isLoading } = usePlaces();
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Lugares y Atractivos</h1>
              <p className="text-muted-foreground max-w-lg">Descubre los rincones más emblemáticos de Real del Monte, desde minas históricas hasta bosques de niebla.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-3 text-center py-12">Cargando lugares...</div>
              ) : (places || []).map((place, i) => (
                <PlaceCard key={place.id || place.name} {...place} index={i} imageUrl={place.imageUrl || defaultImages[i % defaultImages.length]} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default LugaresPage;
