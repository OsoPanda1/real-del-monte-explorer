import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

// API Hooks
import { useEvents } from "@/features/events";

// Fallback images
import heroImg from "@/assets/hero-real-del-monte.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";

const defaultImages = [heroImg, rdm1, rdm2, rdm3];

const EventosPage = () => {
  // API Data
  const { data: events, isLoading } = useEvents();
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Eventos y Festivales</h1>
              <p className="text-muted-foreground max-w-lg">Calendario de actividades culturales, festivales y temporadas especiales.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-3 text-center py-12">Cargando eventos...</div>
              ) : (events || []).map((event, i) => (
                <EventCard key={event.id || event.name} {...event} index={i} imageUrl={event.imageUrl || defaultImages[i % defaultImages.length]} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default EventosPage;
