import { useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Vital para evitar fallos de renderizado
import { useWebSocketSubscription } from '../../hooks/useWebSocket';

interface LSMRenderProps {
  capaActiva: 'turismo' | 'economia' | 'plateria' | 'movilidad';
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
}

interface LSMNodeEvent {
  capa: LSMRenderProps['capaActiva'];
  data: {
    id: string;
    lat: number;
    lng: number;
    intensidadSaturacion?: number;
    ofertaActiva?: boolean;
  };
}

export const LSMRenderEngine = ({ capaActiva, initialViewState }: LSMRenderProps) => {
  const [nodosLSM, setNodosLSM] = useState<LSMNodeEvent['data'][]>([]);
  // Asegúrate de que el hook useWebSocketSubscription esté tipado correctamente
  const lastEvent = useWebSocketSubscription<LSMNodeEvent>('LSM_REALTIME_STREAM');

  // Sincronización de Nodos con limpieza de memoria (máximo 500 nodos para performance)
  useEffect(() => {
    if (lastEvent && lastEvent.capa === capaActiva) {
      setNodosLSM((prev) => {
        const filtrados = prev.filter((n) => n.id !== lastEvent.data.id);
        const nuevos = [...filtrados, lastEvent.data];
        return nuevos.slice(-500); // Mantenemos el engine ligero
      });
    }
  }, [lastEvent, capaActiva]);

  const layers = useMemo(() => {
    return [
      // Capa de Calor: Movilidad y Flujo Humano
      new HeatmapLayer({
        id: 'lsm-saturacion-heatmap',
        data: capaActiva === 'movilidad' ? nodosLSM : [],
        getPosition: (d: any) => [d.lng, d.lat],
        getWeight: (d: any) => d.intensidadSaturacion ?? 0,
        radiusPixels: 40,
        intensity: 1,
        threshold: 0.05,
        // Estética: Gradiente de Obsidian Mist a Crystal Glow
        colorRange: [
          [10, 15, 27],   // Fondo oscuro
          [46, 67, 106],  // Azul TAMV
          [96, 165, 250], // Sky Glow
          [229, 231, 235] // Platinum Peak
        ]
      }),
      // Capa de Nodos: Economía y Platería
      new ScatterplotLayer({
        id: 'lsm-nodos-activos',
        data: (capaActiva === 'economia' || capaActiva === 'plateria') ? nodosLSM : [],
        getPosition: (d: any) => [d.lng, d.lat],
        // Cambio de dorado ostentoso a Platinum/Silver con destellos
        getFillColor: (d: any) => 
          d.ofertaActiva ? [229, 231, 235, 230] : [75, 85, 99, 150], 
        getLineColor: [255, 255, 255, 100],
        stroked: true,
        lineWidthMinPixels: 1,
        getRadius: (d: any) => (d.ofertaActiva ? 25 : 12),
        radiusMinPixels: 4,
        pickable: true,
        onClick: (info) => {
          if (info.object) {
             console.log('Nodo LSM Identificado:', info.object.id);
          }
        },
      }),
    ];
  }, [nodosLSM, capaActiva]);

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
      <DeckGL 
        initialViewState={initialViewState} 
        controller={true} 
        layers={layers}
        getCursor={() => 'crosshair'}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          reuseMaps
        />
      </DeckGL>
      
      {/* Indicador de Capa Activa - Estética Glassmorphism */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-none">
        <span className="text-[10px] uppercase tracking-[2px] text-slate-400 block mb-1">Estatus LSM</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 capitalize">{capaActiva}</span>
        </div>
      </div>
    </div>
  );
};
