import { CalendarClock, MapPin } from "lucide-react";

interface LiveEventBadgeProps {
  event: {
    id: string;
    title: string;
    category: string;
    startsAt: string;
    distanceKm?: number | null;
  };
}

const formatEventTime = (startsAt: string) => {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "Próximamente";

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function LiveEventBadge({ event }: LiveEventBadgeProps) {
  return (
    <article className="min-w-64 rounded-2xl border border-gold-400/25 bg-night-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm">
      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gold-300">
        {event.category}
      </p>
      <h3 className="line-clamp-2 text-sm font-semibold text-silver-100">{event.title}</h3>
      <div className="mt-3 flex items-center gap-3 text-xs text-silver-400">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {formatEventTime(event.startsAt)}
        </span>
        {typeof event.distanceKm === "number" && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>
    </article>
  );
}
