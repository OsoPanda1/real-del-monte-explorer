import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

// API Hooks
import { useCommunityPosts } from "@/lib/hooks";

// Fallback images
import pasteImg from "@/assets/paste.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import minaImg from "@/assets/mina-acosta.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";

const defaultImages = [pasteImg, panteonImg, minaImg, penasImg, callesImg];

const ComunidadPage = () => {
  // API Data
  const { data: posts, isLoading } = useCommunityPosts();
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Muro de Recuerdos</h1>
              <p className="text-muted-foreground max-w-lg">Experiencias, fotos y recuerdos compartidos por visitantes de Real del Monte.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-3 text-center py-12">Cargando publicaciones...</div>
              ) : (posts || []).map((post, i) => (
                <PostCard key={post.id || post.userName + i} {...post} index={i} imageUrl={post.imageUrl || defaultImages[i % defaultImages.length]} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ComunidadPage;
