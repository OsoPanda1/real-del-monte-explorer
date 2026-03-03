import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-real-del-monte.webp";
import logoRdm from "@/assets/logo-rdm.png";
import heroVideo from "@/assets/hero-video.mp4";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const slides = [
    {
      title: "Real del Monte",
      subtitle: "Pueblo Mágico"
    },
    {
      title: "Mineral del Monte",
      subtitle: "Hidalgo, México"
    },
    {
      title: "Cuna del Paste",
      subtitle: "Desde 1560"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* Background */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <video
          src={heroVideo}
          poster={heroImg}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
        
        {/* Futuristic scan lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }} />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <img
            src={logoRdm}
            alt="RDM Digital"
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-white/20"
          />
        </motion.div>

        {/* Location tag */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <MapPin className="w-3 h-3 text-[hsl(43,65%,52%)]" />
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/60 font-light">
            Mineral del Monte · Hidalgo · México
          </span>
        </motion.div>

        {/* Title */}
        <div className="relative h-24 md:h-28 mb-6">
          <AnimatePresence mode="wait">
            {slides.map((slide, index) => (
              index === currentSlide && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center gap-4"
                >
                  <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-white tracking-tight whitespace-nowrap">
                    {slide.title}
                  </h1>
                  <span className="hidden sm:block w-px h-8 bg-[hsl(43,65%,52%)]/50" />
                  <p className="hidden sm:block text-xs md:text-sm text-[hsl(43,65%,52%)] tracking-[0.3em] uppercase font-light">
                    {slide.subtitle}
                  </p>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mb-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                currentSlide === i ? "w-8 bg-[hsl(43,65%,52%)]" : "w-0.5 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button className="px-6 py-3 rounded-full bg-[hsl(43,65%,52%)] text-white text-sm font-medium hover:bg-[hsl(43,65%,52%)]/90 transition-colors">
            Explorar
          </button>
          <button className="px-6 py-3 rounded-full glass text-white text-sm font-medium hover:bg-white/10 transition-colors">
            Ver Mapa
          </button>
        </motion.div>

        {/* Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-white/40" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(35,25%,97%)] to-transparent" />
    </section>
  );
};

export default HeroSection;
