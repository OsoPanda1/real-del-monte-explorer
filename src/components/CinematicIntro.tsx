import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import introVideo from "@/assets/RDM Digital_Call To Action_2_2026-03-03 05_52_52.mp4";
import introAudio from "@/assets/intro_off.mp3";

interface CinematicIntroProps {
  onComplete: () => void;
}

const storyMoments = [
  "Un realmontense visionario decide devolverle a su tierra todo lo aprendido.",
  "Más de 21,600 horas de autoestudio puestas al servicio del patrimonio local.",
  "Reconocido en foros tecnológicos internacionales, pero casi anónimo en casa.",
  "Hoy convierte ese contraste en una misión: elevar Real del Monte con RDM Digital.",
];

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [started, setStarted] = useState(false);
  const [moment, setMoment] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!started) return;

    const timers = [
      setTimeout(() => setMoment(1), 5000),
      setTimeout(() => setMoment(2), 10000),
      setTimeout(() => setMoment(3), 15000),
      setTimeout(() => onComplete(), 22000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [started, onComplete]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const handleStart = async () => {
    setStarted(true);
    try {
      const audio = new Audio(introAudio);
      audio.volume = 0.35;
      await audio.play();
      audioRef.current = audio;
    } catch {
      // Browser may block autoplay; intro video still proceeds.
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[9999] bg-black">
        {!started ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <h1 className="mb-6 text-2xl font-semibold text-silver-100 md:text-4xl">
              Bienvenido a RDM Digital, un pueblo mágico de altura
            </h1>
            <p className="mb-8 max-w-2xl text-sm text-silver-400 md:text-base">
              Al presionar el botón aceptas permisos para audio, video y sesión inmersiva de RDM Digital.
            </p>
            <button
              onClick={handleStart}
              className="rounded-full border border-gold-400/60 bg-gold-400 px-8 py-3 text-sm font-semibold text-night-900 shadow-[0_0_32px_rgba(212,178,106,0.4)]"
            >
              Bienvenido a RDM Digital
            </button>
          </div>
        ) : (
          <>
            <video src={introVideo} autoPlay playsInline className="h-full w-full object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/80" />

            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <motion.p
                key={moment}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="max-w-3xl text-lg leading-relaxed text-silver-100 md:text-3xl"
              >
                {storyMoments[moment]}
              </motion.p>
            </div>

            <button
              onClick={onComplete}
              className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-widest text-silver-300"
            >
              Omitir intro
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
