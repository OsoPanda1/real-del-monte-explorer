import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Compass, Map, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-real-del-monte.webp";
import logoRdm from "@/assets/logo-rdm-digital.png";
import heroVideo from "@/assets/hero-video.mp4";

const slides = [
  { title: "Real del Monte", subtitle: "Pueblo Mágico entre niebla y plata" },
  { title: "Mineral del Monte", subtitle: "Hidalgo · México · 2,700 msnm" },
  { title: "Cuna del Paste", subtitle: "Tradición inglesa desde el siglo XIX" },
  { title: "RDM Digital 2026", subtitle: "Innovación Turística Inteligente" },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen min-h-[700px] w-full overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImg})` }} />
        <video
          src={heroVideo}
          poster={heroImg}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,45%,18%)]/40 via-transparent to-[hsl(220,45%,18%)]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,45%,18%)]/50 via-transparent to-[hsl(220,45%,18%)]/30" />
      </motion.div>

      <motion.div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center" style={{ opacity }}>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="mb-8">
          <img src={logoRdm} alt="RDM Digital" className="h-28 w-28 object-contain md:h-36 md:w-36" />
        </motion.div>

        <div className="mb-8 flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-5 py-2 backdrop-blur-md">
          <MapPin className="h-3 w-3 text-gold-400" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-silver-300 md:text-xs">Mineral del Monte · Hidalgo · México</span>
        </div>

        <div className="relative mb-6 h-24 w-full max-w-4xl md:h-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 flex items-center justify-center gap-4"
            >
              <h1 className="font-display whitespace-nowrap text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl text-silver-100">
                {slides[currentSlide].title}
              </h1>
              <span className="hidden h-8 w-px bg-gold-400/50 sm:block" />
              <p className="hidden text-xs uppercase tracking-[0.3em] text-gold-300 md:text-sm sm:block">{slides[currentSlide].subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mb-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-[3px] rounded-full transition-all ${currentSlide === i ? "w-8 bg-gradient-to-r from-blue-400 to-gold-400" : "w-1.5 bg-silver-500/40"}`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-col gap-3 sm:flex-row">
          <button onClick={() => navigate("/rutas")} className="btn-hero-primary flex items-center gap-2">
            <Compass className="h-4 w-4" /> Diseñar mi visita
          </button>
          <button onClick={() => navigate("/mapa")} className="btn-hero-glass flex items-center gap-2">
            <Map className="h-4 w-4" /> Ver mapa vivo del pueblo
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-10 flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-silver-500">Descubrir</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="h-5 w-5 text-gold-400/60" />
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
