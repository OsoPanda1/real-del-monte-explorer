import { useEffect, useMemo, useState } from 'react';
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

const MAP_BOUNDS = {
  minLat: 20.12,
  maxLat: 20.16,
  minLng: -98.69,
  maxLng: -98.65,
};

const projectPoint = (lat: number, lng: number) => {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
};

export const LSMRenderEngine = ({ capaActiva }: LSMRenderProps) => {
  const [nodosLSM, setNodosLSM] = useState<LSMNodeEvent['data'][]>([]);
  const lastEvent = useWebSocketSubscription<LSMNodeEvent>('LSM_REALTIME_STREAM');

  useEffect(() => {
    if (lastEvent && lastEvent.capa === capaActiva) {
      setNodosLSM((prev) => {
        const filtrados = prev.filter((n) => n.id !== lastEvent.data.id);
        const nuevos = [...filtrados, lastEvent.data];
        return nuevos.slice(-500);
      });
    }
  }, [lastEvent, capaActiva]);

  const nodosVisuales = useMemo(() => {
    return nodosLSM.map((nodo) => {
      const point = projectPoint(nodo.lat, nodo.lng);
      const saturacion = nodo.intensidadSaturacion ?? 0;
      const scale = capaActiva === 'movilidad' ? 0.6 + saturacion : nodo.ofertaActiva ? 1.1 : 0.8;
      return { ...nodo, ...point, scale };
    });
  }, [nodosLSM, capaActiva]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-[#060b16] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.25),transparent_50%),radial-gradient(circle_at_75%_70%,rgba(16,185,129,0.2),transparent_48%),linear-gradient(180deg,#020617,#0f172a)]" />

      {nodosVisuales.map((nodo) => (
        <div
          key={nodo.id}
          className="absolute rounded-full border border-white/20"
          style={{
            left: `${nodo.x}%`,
            top: `${nodo.y}%`,
            width: `${16 * nodo.scale}px`,
            height: `${16 * nodo.scale}px`,
            transform: 'translate(-50%, -50%)',
            background: nodo.ofertaActiva ? 'rgba(229,231,235,0.9)' : 'rgba(96,165,250,0.75)',
            boxShadow: nodo.ofertaActiva
              ? '0 0 0 4px rgba(229,231,235,0.18), 0 0 22px rgba(229,231,235,0.65)'
              : '0 0 0 4px rgba(37,99,235,0.14), 0 0 18px rgba(59,130,246,0.6)',
          }}
          title={`${nodo.id} · capa ${capaActiva}`}
        />
      ))}

      <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-white/10 bg-black/60 p-3 backdrop-blur-md">
        <span className="mb-1 block text-[10px] uppercase tracking-[2px] text-slate-400">Estatus LSM</span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          <span className="text-xs font-bold capitalize text-slate-200">{capaActiva}</span>
        </div>
      </div>
    </div>
  );
};
