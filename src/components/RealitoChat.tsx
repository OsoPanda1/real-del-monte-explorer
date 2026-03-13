import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, MessageCircle, Send, Sparkles, X } from "lucide-react";
import logoRdm from "@/assets/logo-rdm.png";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Location {
  lat: number;
  lon: number;
}

interface ExploreEvent {
  title: string;
  distanceKm?: number | null;
}

interface ExploreBusiness {
  name: string;
  category: string;
}

interface ExploreRoute {
  name: string;
  durationMinutes: number;
  description: string;
}

interface ExploreResponse {
  liveEvents?: ExploreEvent[];
  businesses?: ExploreBusiness[];
  routes?: ExploreRoute[];
}

const suggestions = [
  "¿Qué hacer con 2 horas libres?",
  "¿Dónde comer el mejor paste?",
  "Ruta histórica a pie",
  "¿Qué eventos hay hoy?",
  "Leyendas de Real del Monte",
];

function inferThemeFromMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("paste") || lower.includes("comer") || lower.includes("gastro")) return "gastronomia";
  if (lower.includes("historia") || lower.includes("mina") || lower.includes("museo")) return "historia";
  if (lower.includes("cultura") || lower.includes("arte") || lower.includes("tradición")) return "cultura";
  if (lower.includes("naturaleza") || lower.includes("montaña") || lower.includes("sendero") || lower.includes("eco")) return "ecoturismo";
  return "historia";
}

export default function RealitoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => undefined
    );
  }, []);

  const fetchExploreData = async (theme: string): Promise<ExploreResponse | null> => {
    try {
      const params = location ? `?lat=${location.lat}&lon=${location.lon}` : "";
      const response = await fetch(`/api/explore/theme/${theme}${params}`);
      if (!response.ok) return null;
      return (await response.json()) as ExploreResponse;
    } catch {
      return null;
    }
  };

  const getAssistantReply = async (userText: string) => {
    const theme = inferThemeFromMessage(userText);
    const data = await fetchExploreData(theme);
    const lower = userText.toLowerCase();

    if ((lower.includes("evento") || lower.includes("hoy")) && data?.liveEvents?.length) {
      const events = data.liveEvents.slice(0, 3);
      return `Hoy encontré estos eventos:\n\n${events
        .map((e, i: number) => `${i + 1}. **${e.title}**${e.distanceKm ? ` (${e.distanceKm.toFixed(1)} km)` : ""}`)
        .join("\n")}`;
    }

    if ((lower.includes("paste") || lower.includes("comer")) && data?.businesses?.length) {
      const businesses = data.businesses.slice(0, 3);
      return `Te recomiendo estos lugares:\n\n${businesses
        .map((b, i: number) => `${i + 1}. **${b.name}** · ${b.category}`)
        .join("\n")}`;
    }

    if ((lower.includes("ruta") || lower.includes("recorrido")) && data?.routes?.length) {
      const route = data.routes[0];
      return `Ruta sugerida: **${route.name}** (${route.durationMinutes} min). ${route.description}`;
    }

    return "¡Hola! Soy **REALITO**, tu guía de Real del Monte. Pregúntame por rutas, historia, gastronomía o eventos 🌫️";
  };

  const sendMessage = async (text = input) => {
    const message = text.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: message }]);
    setInput("");
    setIsTyping(true);

    const reply = await getAssistantReply(message);

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    setIsTyping(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 shadow-[0_0_24px_rgba(212,178,106,0.4)]"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -60 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 60 }}>
              <X className="h-6 w-6 text-night-900" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="relative">
              <MessageCircle className="h-6 w-6 text-night-900" />
              <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-night-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-800/95 backdrop-blur"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <img src={logoRdm} alt="REALITO" className="h-9 w-9 rounded-full border border-gold-400/30 p-1" />
              <div>
                <h3 className="text-sm font-bold text-silver-300">REALITO</h3>
                <p className="flex items-center gap-1 text-[11px] text-silver-500">
                  Guía digital
                  {location && <MapPin className="h-3 w-3 text-green-400" />}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="space-y-2 text-center">
                  <p className="text-sm text-silver-400">¿Qué quieres explorar hoy?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => sendMessage(s)} className="rounded-full bg-gold-400/10 px-3 py-1 text-xs text-gold-300 hover:bg-gold-400/20">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-gold-400 text-night-900" : "bg-white/5 text-silver-300"}`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ))}
              {isTyping && <p className="text-xs text-silver-500">REALITO está escribiendo…</p>}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-lg border border-white/15 bg-night-900 px-3 py-2 text-sm text-silver-200 outline-none"
              />
              <button onClick={() => sendMessage()} className="rounded-lg bg-gold-400 px-3 text-night-900">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
