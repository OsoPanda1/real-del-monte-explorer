import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L, { type LeafletEventHandlerFnMap, type Map as LeafletMap } from "leaflet";
import Supercluster from "supercluster";
import "leaflet/dist/leaflet.css";
import type { MapMarkerData, MapViewportState } from "@/features/places/mapTypes";

type ClusterFeature = GeoJSON.Feature<GeoJSON.Point, { cluster: true; cluster_id: number; point_count: number }>;
type PointFeature = GeoJSON.Feature<GeoJSON.Point, { cluster: false; markerId: string }>;

type ClusterItem = ClusterFeature | PointFeature;

interface Map2DPanelProps {
  markers: MapMarkerData[];
  selected: MapMarkerData | null;
  viewport: MapViewportState;
  onSelect: (marker: MapMarkerData) => void;
  onViewportChange: (next: Partial<MapViewportState>) => void;
}

const createPinIcon = (type: MapMarkerData["type"], isPremium?: boolean) => {
  const color = isPremium ? "#f59e0b" : type === "place" ? "#60a5fa" : "#34d399";
  return L.divIcon({
    className: "custom-map-pin",
    html: `<span style="display:flex;width:${isPremium ? 28 : 22}px;height:${isPremium ? 28 : 22}px;border-radius:999px;background:${color};box-shadow:0 0 0 4px rgba(10,15,27,.8),0 0 12px ${color};border:1px solid rgba(255,255,255,.75)"></span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createClusterIcon = (count: number) =>
  L.divIcon({
    className: "custom-cluster-pin",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;background:radial-gradient(circle at top left, rgba(245,158,11,.95), rgba(180,83,9,.9));color:#0b1020;font-size:12px;font-weight:700;box-shadow:0 0 0 6px rgba(15,23,42,.55),0 0 22px rgba(245,158,11,.55);border:1px solid rgba(255,255,255,.85)">${count}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

function MapEventBridge({ onViewportChange }: { onViewportChange: (next: Partial<MapViewportState>) => void }) {
  const map = useMap();

  useEffect(() => {
    const handler: LeafletEventHandlerFnMap = {
      moveend: () => {
        const center = map.getCenter();
        onViewportChange({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
      },
      zoomend: () => {
        const center = map.getCenter();
        onViewportChange({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
      },
    };

    map.on(handler);
    return () => {
      map.off(handler);
    };
  }, [map, onViewportChange]);

  return null;
}

function MapFocus({ selected }: { selected: MapMarkerData | null }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 15), { duration: 0.75 });
  }, [map, selected]);

  return null;
}

function buildClusterIndex(points: PointFeature[]) {
  return new Supercluster<{ cluster: false; markerId: string }, { cluster: true; cluster_id: number; point_count: number }>({
    radius: 58,
    maxZoom: 18,
    minZoom: 0,
  }).load(points);
}

function getBounds(map: LeafletMap): [number, number, number, number] {
  const bounds = map.getBounds();
  return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
}

function ClusterLayer({ markers, onSelect }: { markers: MapMarkerData[]; onSelect: (marker: MapMarkerData) => void }) {
  const map = useMap();
  const markerLookup = useMemo(() => new Map(markers.map((m) => [m.id, m])), [markers]);

  const points = useMemo<PointFeature[]>(
    () =>
      markers.map((marker) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [marker.lng, marker.lat] },
        properties: { cluster: false, markerId: marker.id },
      })),
    [markers],
  );

  const index = useMemo(() => buildClusterIndex(points), [points]);

  const [version, setVersion] = useState(0);

  const clusterItems = useMemo<ClusterItem[]>(() => {
    const bbox = getBounds(map);
    const zoom = Math.floor(map.getZoom());
    return index.getClusters(bbox, zoom) as ClusterItem[];
  }, [index, map, version]);

  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
    map.on("zoomend", refresh);
    map.on("moveend", refresh);
    return () => {
      map.off("zoomend", refresh);
      map.off("moveend", refresh);
    };
  }, [map]);

  return (
    <>
      {clusterItems.map((item) => {
        const [lng, lat] = item.geometry.coordinates;
        if (item.properties.cluster) {
          const count = item.properties.point_count;
          return (
            <Marker
              key={`cluster-${item.properties.cluster_id}`}
              position={[lat, lng]}
              icon={createClusterIcon(count)}
              eventHandlers={{
                click: () => {
                  const expansionZoom = index.getClusterExpansionZoom(item.properties.cluster_id);
                  map.flyTo([lat, lng], Math.min(expansionZoom, 18), { duration: 0.6 });
                },
              }}
            />
          );
        }

        const marker = markerLookup.get(item.properties.markerId);
        if (!marker) return null;

        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createPinIcon(marker.type, marker.isPremium)}
            eventHandlers={{ click: () => onSelect(marker) }}
          >
            <Popup>
              <strong>{marker.name}</strong>
              <p>{marker.description}</p>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export function Map2DPanel({ markers, selected, viewport, onSelect, onViewportChange }: Map2DPanelProps) {
  return (
    <MapContainer
      center={[viewport.lat, viewport.lng]}
      zoom={viewport.zoom}
      className="h-[420px] w-full rounded-2xl md:h-[640px]"
      zoomControl
      style={{
        background:
          "radial-gradient(circle at top left, rgba(46,67,106,0.45), rgba(15,23,42,0.95) 62%, rgba(7,10,18,1))",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapEventBridge onViewportChange={onViewportChange} />
      <MapFocus selected={selected} />
      <ClusterLayer markers={markers} onSelect={onSelect} />
    </MapContainer>
  );
}
