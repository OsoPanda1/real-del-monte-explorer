import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

// API Hooks
import { useBusinesses } from "@/features/businesses";

// Fallback images
import pasteImg from "@/assets/paste.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import minaImg from "@/assets/mina-acosta.webp";
import callesImg from "@/assets/calles-colonial.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";
import rdm4 from "@/assets/rdm02.jpg";

const defaultImages = [pasteImg, panteonImg, minaImg, callesImg, rdm1, rdm2, rdm3, rdm4];

const DirectorioPage = () => {
  // API Data
  const { data: businesses, isLoading } = useBusinesses();
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Directorio de Negocios</h1>
              <p className="text-muted-foreground max-w-lg">Comercios, hoteles, restaurantes y servicios recomendados por la comunidad.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">Cargando negocios...</div>
              ) : (businesses || []).map((biz, i) => (
                <BusinessCard key={biz.id || biz.name} {...biz} index={i} imageUrl={biz.imageUrl || defaultImages[i % defaultImages.length]} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default DirectorioPage;
