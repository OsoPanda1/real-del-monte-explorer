import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import logoRdm from "@/assets/logo-rdm.png";
import heroStreet from "@/assets/calles-colonial.webp";
import heroMina from "@/assets/mina-acosta.webp";
import heroPanteon from "@/assets/panteon-ingles.webp";

const slides = [
  {
    title: "Real del Monte auténtico",
    subtitle: "Calles empedradas y arquitectura histórica del municipio",
    image: heroStreet,
  },
  {
    title: "Legado minero vivo",
    subtitle: "Ruta patrimonial en Mina de Acosta, Mineral del Monte",
    image: heroMina,
  },
  {
    title: "Historia y memoria cultural",
    subtitle: "Panteón Inglés y relatos de una comunidad con identidad única",
    image: heroPanteon,
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = slides[currentSlide];

  return (
    <section ref={containerRef} className="relative h-screen min-h-[700px] w-full overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.image}
            initial={{ opacity: 0.35, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.35, scale: 1.03 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${activeSlide.image})` }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
      </motion.div>

      <motion.div
        className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-white/5 backdrop-blur-xl" />
            <img
              src={logoRdm}
              alt="RDM Digital"
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-1 ring-white/20"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="flex items-center gap-2 mb-7 px-5 py-2 rounded-full border border-white/20 bg-black/25 backdrop-blur-md"
        >
          <MapPin className="w-3 h-3 text-gold" />
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/75 font-light">
            Vista real de Mineral del Monte · Hidalgo · México
          </span>
        </motion.div>

        <div className="relative min-h-[140px] md:min-h-[160px] mb-5 w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-white tracking-tight">
                {activeSlide.title}
              </h1>
              <p className="mt-4 text-sm md:text-base text-gold/90 tracking-[0.16em] uppercase font-light max-w-4xl">
                {activeSlide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mb-10">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              onClick={() => setCurrentSlide(i)}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                currentSlide === i
                  ? "w-10 bg-gold shadow-[0_0_12px_hsla(43,65%,52%,0.8)]"
                  : "w-2 bg-white/35"
              }`}
              aria-label={`Ir a vista ${i + 1}`}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button className="btn-hero-primary">Planear visita real del municipio</button>
          <button className="btn-hero-glass">Explorar mapa cultural del pueblo</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-white/35 font-light">Desliza para descubrir</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4 text-white/35" />
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
