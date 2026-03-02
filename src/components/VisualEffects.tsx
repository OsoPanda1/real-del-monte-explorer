import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Effect 1: Floating Particles (Gold dust effect)
export const FloatingParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ["#D4AF37", "#C9A227", "#B8941F", "#E5C100"];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.y += particle.speedY;
        if (particle.y > canvas.height) {
          particle.y = -5;
          particle.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

// Effect 2: Fog Layer
export const FogLayer = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(ellipse 80% 50% at 20% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 50% at 80% 100%, rgba(255,255,255,0.4) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 50% at 20% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

// Effect 3: Parallax Image
export const ParallaxImage = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// Effect 4: Text Reveal on Scroll
export const TextReveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Effect 5: Magnetic Button
export const MagneticButton = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
    </button>
  );
};

// Effect 6: Shimmer Border
export const ShimmerBorder = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-[hsl(43,65%,52%)] to-transparent opacity-30 animate-pulse" />
      <div className="relative rounded-2xl overflow-hidden">{children}</div>
    </div>
  );
};

// Effect 7: Ken Burns Background
export const KenBurnsBackground = ({ src }: { src: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${src})` }}
        animate={{
          scale: [1, 1.1],
          x: ["0%", "-2%"],
          y: ["0%", "-2%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      />
    </div>
  );
};

// Effect 8: Video Background with Overlay
export const VideoBackground = ({ src, poster }: { src: string; poster?: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
    </div>
  );
};

// Effect 9: Staggered Fade In
export const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Effect 10: Glow Effect on Hover
export const GlowCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative group ${className}`}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(43,65%,52%)] to-[hsl(18,45%,48%)] rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500" />
      <div className="relative">{children}</div>
    </motion.div>
  );
};

// Background Mesh Gradient
export const MeshGradient = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(43,65%,52%)]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(18,45%,48%)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(145,25%,25%)]/5 rounded-full blur-3xl" />
    </div>
  );
};

export default {
  FloatingParticles,
  FogLayer,
  ParallaxImage,
  TextReveal,
  MagneticButton,
  ShimmerBorder,
  KenBurnsBackground,
  VideoBackground,
  StaggerContainer,
  StaggerItem,
  GlowCard,
  MeshGradient,
};
