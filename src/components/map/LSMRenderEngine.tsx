import { useEffect, useMemo, useState } from 'react';
import {
  Circle,
  LayerGroup,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet';
import type { CircleMarkerProps } from 'react-leaflet';
import { useWebSocketSubscription } from '../../hooks/useWebSocket';

interface LSMRenderProps {
  capaActiva: 'turismo' | 'economia' | 'plateria' | 'movilidad';
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

interface LSMNodeData {
  id: string;
  lat: number;
  lng: number;
  intensidadSaturacion?: number;
  ofertaActiva?: boolean;
  etiqueta?: string;
}

interface LSMNodeEvent {
  capa: LSMRenderProps['capaActiva'];
  data: LSMNodeData;
}

const getNodeStyle = (
  capa: LSMRenderProps['capaActiva'],
  node: LSMNodeData,
): Pick<CircleMarkerProps, 'pathOptions' | 'radius'> => {
  if (capa === 'movilidad') {
    const intensidad = Math.max(0, Math.min(1, node.intensidadSaturacion ?? 0));
    const color = intensidad > 0.85 ? '#ef4444' : intensidad > 0.6 ? '#f59e0b' : '#22c55e';
    const radius = 20 + intensidad * 80;
    return {
      radius,
      pathOptions: { color, fillColor: color, fillOpacity: 0.35, weight: 1 },
    };
  }

  const isOferta = Boolean(node.ofertaActiva);
  return {
    radius: isOferta ? 28 : 14,
    pathOptions: {
      color: isOferta ? '#facc15' : '#64748b',
      fillColor: isOferta ? '#eab308' : '#475569',
      fillOpacity: 0.55,
      weight: isOferta ? 2 : 1,
    },
  };
};

export const LSMRenderEngine = ({ capaActiva, initialViewState }: LSMRenderProps) => {
  const [nodosLSM, setNodosLSM] = useState<LSMNodeData[]>([]);
  const lastEvent = useWebSocketSubscription<LSMNodeEvent>('LSM_REALTIME_STREAM');

  useEffect(() => {
    setNodosLSM([]);
  }, [capaActiva]);

  useEffect(() => {
    if (!lastEvent || lastEvent.capa !== capaActiva) {
      return;
    }

    setNodosLSM((prev) => {
      const filtered = prev.filter((n) => n.id !== lastEvent.data.id);
      return [...filtered, lastEvent.data];
    });
  }, [lastEvent, capaActiva]);

  const orderedNodes = useMemo(
    () => [...nodosLSM].sort((a, b) => (b.intensidadSaturacion ?? 0) - (a.intensidadSaturacion ?? 0)),
    [nodosLSM],
  );

  return (
    <MapContainer
      center={[initialViewState.latitude, initialViewState.longitude]}
      zoom={initialViewState.zoom}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayerGroup>
        {orderedNodes.map((node) => {
          const style = getNodeStyle(capaActiva, node);
          return (
            <Circle key={node.id} center={[node.lat, node.lng]} radius={style.radius} pathOptions={style.pathOptions}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{node.etiqueta ?? `Nodo ${node.id}`}</p>
                  <p className="text-xs">Capa: {capaActiva}</p>
                  <p className="text-xs">
                    Intensidad: {(node.intensidadSaturacion ?? 0).toFixed(2)} | Oferta:{' '}
                    {node.ofertaActiva ? 'activa' : 'inactiva'}
                  </p>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </LayerGroup>
    </MapContainer>
  );
};
