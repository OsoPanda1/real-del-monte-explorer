import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Mountain, Wind, Thermometer, Clock } from "lucide-react";
import heroImg from "@/assets/hero-real-del-monte.webp";
import logoRdm from "@/assets/logo-rdm.png";
import heroVideo from "@/assets/hero-video.mp4";
import { FogLayer, FloatingParticles } from "./VisualEffects";

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
      subtitle: "Donde la plata forjó una nación",
      description: "Pueblo Mágico con herencia Cornish-Mexicana",
      stat: "2,700 msnm"
    },
    {
      title: "Mineral del Monte",
      subtitle: "2,700 metros más cerca de las estrellas",
      description: "Entre la neblina y el bosque de oyamel",
      stat: "10-18°C"
    },
    {
      title: "Cuna del Paste",
      subtitle: "El sabor de Cornualles en México",
      description: "500 años de tradición gastronómica",
      stat: "Desde 1560"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen min-h-[900px] w-full overflow-hidden">
      {/* Video Background with Fallback Image */}
      <motion.div 
        className="absolute inset-0"
        style={{ y, scale }}
      >
        {/* Fallback Image (always visible beneath video) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImg})`,
            filter: isVideoLoaded ? "blur(0px)" : "blur(0px)"
          }}
        />
        
        {/* Video Element */}
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
        
        {/* Atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        
        {/* Gold vignette effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)"
          }}
        />
        
        {/* Fog Layer */}
        <FogLayer />
        
        {/* Animated mist */}
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            background: [
              "radial-gradient(ellipse 100% 50% at 30% 100%, rgba(212,175,55,0.05) 0%, transparent 60%)",
              "radial-gradient(ellipse 100% 50% at 70% 100%, rgba(212,175,55,0.08) 0%, transparent 60%)",
              "radial-gradient(ellipse 100% 50% at 30% 100%, rgba(212,175,55,0.05) 0%, transparent 60%)",
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <motion.div 
        className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center"
        style={{ opacity }}
      >
        {/* Location Badge with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full glass border border-[hsl(43,65%,52%,0.3)]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[hsl(43,65%,52%,0.2)] to-transparent animate-pulse" />
            <MapPin className="w-4 h-4 text-[hsl(43,65%,52%)]" />
            <span className="text-sm text-white/90 font-medium tracking-wide">
              Mineral del Monte, Hidalgo, México
            </span>
          </div>
        </motion.div>

        {/* Logo with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, type: "spring" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-[hsl(43,65%,52%)]/30 blur-3xl rounded-full animate-pulse" />
          <img
            src={logoRdm}
            alt="RDM Digital"
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-[hsl(43,65%,52%)]/50 shadow-2xl"
          />
        </motion.div>

        {/* Animated Title Carousel */}
        <div className="relative h-56 md:h-64 mb-8">
          <AnimatePresence mode="wait">
            {slides.map((slide, index) => (
              index === currentSlide && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-4 leading-none drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-[hsl(43,65%,52%)] font-light mb-3 tracking-[0.2em] uppercase">
                    {slide.subtitle}
                  </p>
                  <p className="text-base md:text-lg text-white/70 max-w-lg font-light">
                    {slide.description}
                  </p>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12"
        >
          {[
            { icon: Mountain, label: "2,700 msnm", desc: "Altitud" },
            { icon: Thermometer, label: "10-18°C", desc: "Clima" },
            { icon: Wind, label: "Neblina", desc: "Ambiente" },
            { icon: Clock, label: "1560", desc: "Fundación" },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              className="group flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-white/10 hover:border-[hsl(43,65%,52%)]/30 transition-all duration-500"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <item.icon className="w-5 h-5 text-[hsl(43,65%,52%)] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-lg font-bold text-white">{item.label}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Slide Indicators */}
        <div className="flex gap-3 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentSlide === i 
                  ? "w-12 bg-[hsl(43,65%,52%)]" 
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="btn-premium group">
            <span className="relative z-10 flex items-center gap-2">
              Explorar el Pueblo
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </span>
          </button>
          <button className="btn-glass">
            Ver Mapa Interactivo
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/40 uppercase tracking-[0.3em]">Descubrir</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div 
              className="w-1 h-2 bg-[hsl(43,65%,52%)] rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Side Navigation */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-20">
        {["Inicio", "Historia", "Cultura", "Mapa", "Gastronomía"].map((item, i) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="group flex items-center gap-3 text-white/40 hover:text-white transition-all duration-300"
            whileHover={{ x: -5 }}
          >
            <span className={`w-8 h-[2px] transition-all duration-300 ${
              i === 0 ? "bg-[hsl(43,65%,52%)] w-12" : "bg-current group-hover:w-12 group-hover:bg-[hsl(43,65%,52%)]"
            }`} />
            <span className="text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item}
            </span>
          </motion.a>
        ))}
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[hsl(35,25%,97%)] to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
