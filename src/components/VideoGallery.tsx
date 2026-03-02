import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
}

const videos: Video[] = [
  {
    id: "1",
    title: "Bienvenidos a Real del Monte",
    description: "Descubre la magia de nuestro Pueblo Mágico",
    thumbnail: "/assets/hero-real-del-monte.webp",
    duration: "2:30",
    category: "Introducción"
  },
  {
    id: "2",
    title: "Tour por la Mina de Acosta",
    description: "Descenso a 450 metros bajo tierra",
    thumbnail: "/assets/mina-acosta.webp",
    duration: "5:45",
    category: "Aventura"
  },
  {
    id: "3",
    title: "El Panteón Inglés",
    description: "Historia y leyendas del cementerio más alto del mundo",
    thumbnail: "/assets/panteon-ingles.webp",
    duration: "4:20",
    category: "Historia"
  },
  {
    id: "4",
    title: "Peñas Cargadas",
    description: "Senderismo entre formaciones rocosas únicas",
    thumbnail: "/assets/penas-cargadas.webp",
    duration: "3:15",
    category: "Naturaleza"
  },
  {
    id: "5",
    title: "Festival del Paste",
    description: "Celebración gastronómica anual",
    thumbnail: "/assets/paste.webp",
    duration: "6:00",
    category: "Cultura"
  },
  {
    id: "6",
    title: "Calles Coloniales",
    description: "Paseo por el centro histórico",
    thumbnail: "/assets/calles-colonial.webp",
    duration: "3:45",
    category: "Arquitectura"
  }
];

export const VideoCard = ({ video, onClick }: { video: Video; onClick: () => void }) => {
  return (
    <motion.div
      layoutId={`video-${video.id}`}
      className="group cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative rounded-2xl overflow-hidden aspect-video mb-3">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="w-16 h-16 rounded-full bg-[hsl(43,65%,52%)]/90 flex items-center justify-center backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </motion.div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-medium">
          {video.duration}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-xs font-medium">
          {video.category}
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
      
      <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-[hsl(43,65%,52%)] transition-colors">
        {video.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
    </motion.div>
  );
};

export const VideoPlayer = ({ video, onClose }: { video: Video; onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId={`video-${video.id}`}
        className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src="/assets/hero-video.mp4"
          poster={video.thumbnail}
          autoPlay
          className="w-full h-full object-cover"
          onTimeUpdate={(e) => {
            const video = e.target as HTMLVideoElement;
            setProgress((video.currentTime / video.duration) * 100);
          }}
        />
        
        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          {/* Title */}
          <div className="absolute top-4 left-4">
            <h3 className="text-white font-display text-xl">{video.title}</h3>
            <p className="text-white/70 text-sm">{video.description}</p>
          </div>
          
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer">
              <div 
                className="h-full bg-[hsl(43,65%,52%)] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) videoRef.current.pause();
                      else videoRef.current.play();
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className="w-12 h-12 rounded-full bg-[hsl(43,65%,52%)] flex items-center justify-center hover:bg-[hsl(43,65%,52%)]/80 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  )}
                </button>
                
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
              
              <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors">
                <Maximize className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const VideoGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass text-xs font-medium text-[hsl(43,65%,52%)] mb-4">
              Experiencias Visuales
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Galería de Videos
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sumérgete en la magia de Real del Monte a través de nuestras producciones audiovisuales
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <VideoCard 
                  video={video} 
                  onClick={() => setSelectedVideo(video)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer 
            video={selectedVideo} 
            onClose={() => setSelectedVideo(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoGallery;
