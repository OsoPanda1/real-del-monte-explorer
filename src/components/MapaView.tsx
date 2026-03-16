"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import { Map as MapIcon, Navigation, Layers, Activity, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * HOOK DE EVOLUCIÓN: Motor de Renderizado Mapbox
 * Extrae la complejidad de inicialización para mantener el componente ligero.
 */
const useMapboxCore = (containerRef: React.RefObject<HTMLDivElement | null>, viewMode: "2d" | "3d") => {
  const mapRef = useRef<MapboxMap | null>(null);
  const CENTER = { lng: -98.6733, lat: 20.1389 };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11", // Obsidian Mist Base
      center: [CENTER.lng, CENTER.lat],
      zoom: 15,
      pitch: viewMode === "3d" ? 60 : 0,
      bearing: viewMode === "3d" ? -20 : 0,
      antialias: true,
    });

    map.on("load", () => {
      // Inyección de Terreno 3D
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 14,
      });
      
      if (viewMode === "3d") map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      // Sky Layer para atmósfera de montaña
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });

      // Extrusión Platinum para edificios
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#E5E7EB", // Platinum
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.5,
        },
      });
      
      mapRef.current = map;
    });

    return () => map.remove();
  }, []);

  return mapRef;
};

export default function MapaView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const mapRef = useMapboxCore(mapContainerRef, viewMode);

  // Efecto de transición de cámara
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (viewMode === "2d") {
      map.setTerrain(undefined);
      map.flyTo({ pitch: 0, bearing: 0, duration: 2000 });
    } else {
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      map.flyTo({ pitch: 65, bearing: -25, zoom: 15.5, duration: 2000 });
    }
  }, [viewMode]);

  return (
    <div className="flex flex-col gap-6 p-2">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-light tracking-tighter text-white">
            Gemelo Digital <span className="italic text-slate-400">RDM</span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
            <Hexagon className="w-3 h-3 text-blue-400" />
            <span>Sincronización LSM v4.2 - Activa</span>
          </div>
        </div>

        <nav className="flex bg-white/5 backdrop-blur-xl p-1 rounded-full border border-white/10">
          {(["2d", "3d"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-6 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                viewMode === mode ? "bg-white text-black shadow-lg" : "text-white/50 hover:text-white"
              }`}
            >
              {mode} View
            </button>
          ))}
        </nav>
      </header>

      <section className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl">
        <div ref={mapContainerRef} className="h-full w-full" />
        
        {/* Crystal Glow Pulse Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="h-[40rem] w-[40rem] rounded-full border border-white/10 shadow-[inset_0_0_100px_rgba(255,255,255,0.05)]"
          />
        </div>

        {/* Telemetry Panel */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="pointer-events-auto flex items-center gap-5 rounded-3xl border border-white/10 bg-black/60 p-5 backdrop-blur-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Navigation className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Node Location</p>
              <p className="font-mono text-sm font-bold text-white tracking-widest">20.1389° N | 98.6733° W</p>
            </div>
          </motion.div>
          
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em]">Digital Sovereignty Protocol</p>
            <p className="text-xs font-serif italic text-white/40">Real del Monte, Hidalgo</p>
          </div>
        </div>
      </section>

      {/* Stats Engine Grid */}
      <footer className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Active Federated Nodes", value: "124", icon: Layers, color: "text-blue-400" },
          { label: "Kernel Frequency", value: "1.2 GHz", icon: Activity, color: "text-emerald-400" },
          { label: "LSM Sync Matrix", value: "98.2%", icon: MapIcon, color: "text-platinum" },
        ].map((stat) => (
          <div key={stat.label} className="group overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05]">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-white/5 p-4 text-slate-400 group-hover:scale-110 transition-transform">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="text-2xl font-light text-slate-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
