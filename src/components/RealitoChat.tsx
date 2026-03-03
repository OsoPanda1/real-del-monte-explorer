import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, MapPin, Clock } from "lucide-react";
import logoRdm from "@/assets/logo-rdm.png";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

interface Location {
  lat: number;
  lon: number;
}

const suggestions = [
  "¿Qué hacer con 2 horas libres?",
  "¿Dónde comer el mejor paste?",
  "Ruta histórica a pie",
  "¿Qué eventos hay hoy?",
  "Leyendas de Real del Monte",
];

// Infer theme from message
function inferThemeFromMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("paste") || lower.includes("comer") || lower.includes("gastro")) 
    return "gastronomia";
  if (lower.includes("historia") || lower.includes("mina") || lower.includes("museo")) 
    return "historia";
  if (lower.includes("cultura") || lower.includes("arte") || lower.includes("tradición")) 
    return "cultura";
  if (lower.includes("naturaleza") || lower.includes("montaña") || lower.includes("sendero") || lower.includes("eco")) 
    return "ecoturismo";
  return "historia"; // Default
}

// Format explore data for the AI context
function formatExploreContext(data: any): string {
  let context = "";
  
  if (data.liveEvents && data.liveEvents.length > 0) {
    context += "\n📍 Eventos cerca de ti:\n";
    data.liveEvents.slice(0, 3).forEach((e: any) => {
      context += `- ${e.title} (${e.category})`;
      if (e.distanceKm) context += ` a ${e.distanceKm.toFixed(1)}km`;
      context += "\n";
    });
  }
  
  if (data.businesses && data.businesses.length > 0) {
    context += "\n🏪 Lugares recomendados:\n";
    data.businesses.slice(0, 3).forEach((b: any) => {
      context += `- ${b.name} (${b.category})\n`;
    });
  }
  
  if (data.routes && data.routes.length > 0) {
    context += "\n🗺️ Rutas disponibles:\n";
    data.routes.slice(0, 2).forEach((r: any) => {
      context += `- ${r.name} (${r.durationMinutes} min)\n`;
    });
  }
  
  return context;
}

export default function RealitoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {
          // Location denied, continue without it
          console.log("Location access denied");
        }
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchExploreData = async (theme: string): Promise<any> => {
    try {
      const params = location ? `?lat=${location.lat}&lon=${location.lon}` : "";
      const response = await fetch(`/api/explore/theme/${theme}${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return await response.json();
    } catch (error) {
      console.error("Error fetching explore data:", error);
      return null;
    }
  };

  const getAIResponse = async (msg: string): Promise<string> => {
    const theme = inferThemeFromMessage(msg);
    const exploreData = await fetchExploreData(theme);
    
    // If we have explore data, use it to enhance the response
    if (exploreData) {
      const context = formatExploreContext(exploreData);
      
      // For now, we'll use a hybrid approach - local responses with real data
      const lower = msg.toLowerCase();
      
      if (lower.includes("evento") || lower.includes("hoy") || lower.includes("ahora")) {
        if (exploreData.liveEvents?.length > 0) {
          const events = exploreData.liveEvents.slice(0, 3);
          let response = "Hoy la neblina está baja sobre el centro de Real del Monte. ";
          response += "Aquí hay eventos que están sucediendo cerca de ti:\n\n";
          events.forEach((e: any, i: number) => {
            response += `${i + 1}. **${e.title}**`;
            if (e.distanceKm) response += ` (a ${e.distanceKm.toFixed(1)}km)`;
            response += "\n";
          });
          response += "\n¿Te gustaría que te dé direcciones para alguno? 🌟";
          return response;
        } else {
          return "Hoy no hay eventos especiales programados cerca de tu ubicación, pero siempre hay algo mágico que descubrir en Real del Monte. ¿Te gustaría que te recomiende algunos lugares? 🌫️";
        }
      }
      
      if (lower.includes("paste") || lower.includes("comer") || lower.includes("restaurante")) {
        let response = "¡Los pastes son el alma de Real del Monte! ";
        
        if (exploreData.businesses?.length > 0) {
          const businesses = exploreData.businesses.slice(0, 3);
          response += "Basado en tu ubicación, te recomiendo:\n\n";
          businesses.forEach((b: any, i: number) => {
            response += `${i + 1}. **${b.name}** - ${b.category}\n`;
          });
        } else {
          response += "Te recomiendo **Pastes El Portal** en la Plaza Principal, con receta original cornish desde 1985. Prueba el de mole o el tradicional de papa con carne. 🥟";
        }
        
        response += "\n\n¿Te gustaría una ruta gastronómica? 🍽️";
        return response;
      }
      
      if (lower.includes("ruta") || lower.includes("recorrido")) {
        if (exploreData.routes?.length > 0) {
          const route = exploreData.routes[0];
          return `Tengo una ruta perfecta para ti: **${route.name}**. Dura aproximadamente ${route.durationMinutes} minutos y te llevará por ${route.stops?.length || "varios"} puntos de interés. ${route.description}\n\n¿Quieres que te dé más detalles? 🚶‍♂️`;
        }
      }
    }
    
    // Fallback to local responses
    return getLocalResponse(msg);
  };

  // Simple local responses as fallback
  function getLocalResponse(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes("paste") || lower.includes("comer"))
      return "¡Los pastes son imperdibles! Te recomiendo **Pastes El Portal** en la Plaza Principal, con receta original cornish desde 1985. Prueba el de mole o el tradicional de papa con carne. También **Café La Neblina** tiene postres increíbles. 🥟";
    if (lower.includes("2 horas") || lower.includes("poco tiempo"))
      return "Con 2 horas te sugiero: 1️⃣ Visita la **Plaza Principal** y la Parroquia. 2️⃣ Camina por los callejones coloniales. 3️⃣ Come un paste en **El Portal**. 4️⃣ Si alcanzas, asómate al **Museo del Paste**. ¡Una experiencia compacta pero mágica! ⏱️";
    if (lower.includes("historia") || lower.includes("mina"))
      return "La **Ruta Histórica a Pie** dura ~3 horas: Plaza Principal → Parroquia de la Asunción → Calles coloniales → Casa de la Cultura → Mina de Acosta → Panteón Inglés. ¡Lleva zapatos cómodos y cámara! 🚶‍♂️📸";
    if (lower.includes("niño") || lower.includes("familia"))
      return "Con niños te recomiendo: 🎢 **Mina de Acosta** (les encanta bajar en el trenecito). 🏛️ **Museo del Paste** (taller para hacer pastes). 🪨 **Peñas Cargadas** (caminata fácil con rocas gigantes). ¡Y muchos pastes de postre!";
    if (lower.includes("leyenda"))
      return "Real del Monte tiene leyendas fascinantes: 👻 La del **minero fantasma** que recorre los túneles de la Mina de Acosta. 💀 Los relatos del **Panteón Inglés** y los espíritus cornish. 🌫️ La neblina que según los locales trae consigo ecos del pasado minero. ¡Pregunta en el pueblo, cada habitante tiene una historia!";
    return "¡Hola! Soy **REALITO**, tu guía digital de Real del Monte. 🏔️ Puedo ayudarte con rutas, lugares, gastronomía, historia y leyendas del Pueblo Mágico. ¿Qué te gustaría saber?";
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Get AI response with explore data
    const botContent = await getAIResponse(text);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      content: botContent,
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold-400 to-gold-500 shadow-[0_0_24px_rgba(212,178,106,0.45)]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-night-900" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle className="h-6 w-6 text-night-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-800/95 shadow-2xl backdrop-blur-xl"
            style={{ height: 500, maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-gold-400/20 to-gold-500/10 px-4 py-3">
              <div className="relative">
                <img src={logoRdm} alt="REALITO" className="h-9 w-9 rounded-full border border-gold-400/30 object-contain p-0.5" />
                {location && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-silver-300">REALITO</h3>
                <p className="flex items-center gap-1 text-[11px] text-silver-500">
                  Guía digital de Real del Monte
                  {location && <MapPin className="h-3 w-3 text-green-400" />}
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-gold-400/60" />
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="py-6 text-center">
                  <img src={logoRdm} alt="REALITO" className="mx-auto mb-3 h-16 w-16 opacity-60" />
                  <p className="mb-4 text-sm text-silver-500">
                    ¡Hola! Soy <strong className="text-gold-400">REALITO</strong>, tu guía del Pueblo Mágico.
                    {location ? " Estoy usando tu ubicación para recomendarte eventos cercanos." : ""}
                    ¿En qué te ayudo?
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="rounded-full bg-gold-400/10 px-3 py-1.5 text-xs text-gold-400 transition-colors hover:bg-gold-400/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-gold-400 text-night-900"
                        : "rounded-bl-md border border-white/10 bg-night-700/50 text-silver-300"
                    }`}
                  >
                    {m.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className={m.role === "user" ? "text-night-900" : "text-gold-400"}>{part}</strong> : <span key={i}>{part}</span>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-night-700/50 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-gold-400/50"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Pregúntale a REALITO..."
                className="flex-1 rounded-xl border border-white/10 bg-night-900/50 px-3 py-2 text-sm text-silver-300 outline-none transition-colors placeholder:text-silver-500/60 focus:border-gold-400/30"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400 text-night-900 transition-colors hover:bg-gold-500 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
