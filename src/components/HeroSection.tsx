import { motion } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-real-del-monte.webp";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-night-900 via-night-800 to-night-700 text-silver-300">
      {/* Fog and subtle particles overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/5 via-white/0 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night-900 via-night-800/80 to-transparent" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,178,106,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,178,106,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-900/80 via-night-800/60 to-night-900/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,178,106,0.15),transparent_50%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-24 lg:pt-32">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Text content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Location badge */}
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-gold-400 shadow-[0_0_12px_rgba(212,178,106,0.9)]" />
              <span className="text-xs uppercase tracking-[0.25em] text-silver-400">
                Real del Monte · 2700 msnm
              </span>
            </div>

            {/* Main title */}
            <div className="space-y-4">
              <h1 className="font-serif text-4xl leading-tight text-silver-300 md:text-5xl lg:text-6xl">
                Cruza la neblina.
                <span className="mt-2 block text-gold-400">
                  Entra al pueblo frío que abriga a quien llega.
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="max-w-xl text-sm leading-relaxed text-silver-400 md:text-base">
              RDM Digital es la guía viva de Real del Monte: minas profundas, callejones antiguos,
              pastes humeantes y leyendas que solo se cuentan al calor de una mesa. 
              Aquí no solo visitas un pueblo; atraviesas un umbral.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/lugares">
                <button className="rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold tracking-wide text-night-900 shadow-[0_0_24px_rgba(212,178,106,0.45)] transition-colors hover:bg-gold-500">
                  Entrar al mundo de Real del Monte
                </button>
              </Link>
              <Link to="/relatos">
                <button className="rounded-full border border-white/20 px-6 py-3 text-sm text-silver-300 transition-colors hover:bg-white/5">
                  Escuchar una leyenda
                </button>
              </Link>
            </div>

            {/* Stats or highlights */}
            <div className="flex gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-2xl font-serif text-gold-400">1560</p>
                <p className="text-xs uppercase tracking-wider text-silver-500">Fundación</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-serif text-gold-400">2,700m</p>
                <p className="text-xs uppercase tracking-wider text-silver-500">Altitud</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-serif text-gold-400">Pueblo</p>
                <p className="text-xs uppercase tracking-wider text-silver-500">Mágico</p>
              </div>
            </div>
          </motion.div>

          {/* Visual panel */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-night-800/50 to-night-900 shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0,rgba(212,178,106,0.25),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(196,204,216,0.18),transparent_60%)]" />
              <div 
                className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
                style={{ backgroundImage: `url(${heroImg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-transparent to-transparent" />
              
              {/* Content inside visual panel */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-2xl border border-white/10 bg-night-900/80 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/20">
                      <MapPin className="h-5 w-5 text-gold-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-silver-300">Mineral del Monte</p>
                      <p className="text-xs text-silver-500">Hidalgo, México</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-gold-400/30" />
              <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-gold-400/30" />
              <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gold-400/30" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gold-400/30" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Compass, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-real-del-monte.webp";
import logoRdm from "@/assets/logo-rdm-digital.png";
import heroVideo from "@/assets/hero-video.mp4";

const slides = [
  {
    title: "Real del Monte",
    subtitle: "Pueblo Mágico entre niebla y plata",
  },
  {
    title: "Mineral del Monte",
    subtitle: "Hidalgo · México · 2,700 msnm",
  },
  {
    title: "Cuna del Paste",
    subtitle: "Tradición inglesa desde el siglo XIX",
  },
  {
    title: "RDM Digital 2026",
    subtitle: "Innovación Turística Inteligente",
  },
];

const HeroSection = () => {
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

  const handleDesignVisit = () => {
    navigate("/rutas");
  };

  const handleViewMap = () => {
    navigate("/mapa");
  };

  return (
    <section ref={containerRef} className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* Background: imagen + video + overlays */}
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
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Gradientes cinematográficos - Navy theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,45%,18%)]/40 via-transparent to-[hsl(220,45%,18%)]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,45%,18%)]/50 via-transparent to-[hsl(220,45%,18%)]/30" />

        {/* Neblina y líneas sutiles */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
        }} />

        {/* Fog overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[hsl(220,45%,18%)]/70 to-transparent" />
      </motion.div>

      {/* Contenido principal */}
      <motion.div
        className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            {/* Glow effect */}
            <div 
              className="absolute -inset-4 rounded-full blur-2xl opacity-40"
              style={{
                background: "radial-gradient(circle, hsla(210,100%,55%,0.4) 0%, hsla(43,80%,55%,0.2) 50%, transparent 70%)"
              }}
            />
            <img
              src={logoRdm}
              alt="RDM Digital"
              className="relative w-28 h-28 md:w-36 md:h-36 object-contain"
              style={{
                filter: "drop-shadow(0 0 20px hsla(210,100%,55%,0.3))"
              }}
            />
          </div>
        </motion.div>

        {/* Location tag */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-2 mb-8 px-5 py-2 rounded-full"
          style={{
            background: "hsla(210,100%,55%,0.1)",
            border: "1px solid hsla(210,100%,55%,0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <MapPin className="w-3 h-3" style={{ color: "hsl(43,80%,55%)" }} />
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-light" style={{ color: "hsla(210,30%,85%,0.8)" }}>
            Mineral del Monte · Hidalgo · México
          </span>
        </motion.div>

        {/* Títulos rotatorios */}
        <div className="relative h-24 md:h-28 mb-6 w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {slides.map(
              (slide, index) =>
                index === currentSlide && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex items-center justify-center gap-4"
                  >
                    <h1 
                      className="font-display text-3xl md:text-5xl lg:text-6xl tracking-tight whitespace-nowrap font-bold"
                      style={{
                        background: "linear-gradient(135deg, hsl(0,0%,98%), hsl(43,60%,75%), hsl(0,0%,90%))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {slide.title}
                    </h1>
                    <span className="hidden sm:block w-px h-8" style={{ background: "hsla(43,80%,55%,0.5)" }} />
                    <p className="hidden sm:block text-xs md:text-sm tracking-[0.3em] uppercase font-light" style={{ color: "hsl(43,70%,65%)" }}>
                      {slide.subtitle}
                    </p>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>

        {/* Indicadores */}
        <div className="flex gap-2 mb-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                currentSlide === i
                  ? "w-8"
                  : "w-1.5"
              }`}
              style={{
                background: currentSlide === i 
                  ? "linear-gradient(90deg, hsl(210,100%,55%), hsl(43,80%,55%))"
                  : "hsla(210,30%,70%,0.35)",
                boxShadow: currentSlide === i ? "0 0 15px hsla(210,100%,55%,0.6)" : "none",
              }}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Botones de acción - FUNCIONALES */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button 
            onClick={handleDesignVisit}
            className="btn-hero-primary flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Diseñar mi visita
          </button>
          <button 
            onClick={handleViewMap}
            className="btn-hero-glass flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            Ver mapa vivo del pueblo
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-silver-500">Descubrir</span>
          <span className="text-[10px] tracking-[0.4em] uppercase font-light" style={{ color: "hsla(210,30%,70%,0.4)" }}>
            Desliza para entrar
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="h-5 w-5 text-gold-400/60" />
          </motion.div>
        </motion.div>
      </div>
            <ChevronDown className="w-4 h-4" style={{ color: "hsla(210,30%,70%,0.4)" }} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Fade inferior hacia el contenido */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
