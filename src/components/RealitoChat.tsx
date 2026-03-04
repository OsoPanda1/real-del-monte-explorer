import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, Sparkles, Bot, User, 
  MapPin, Utensils, Camera, History, HelpCircle,
  Clock, Thermometer, Mountain, Calendar, Route,
  AlertCircle, CheckCircle, Volume2, VolumeX
} from "lucide-react";
import logoRdm from "@/assets/logo-rdm.png";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  type?: "text" | "route" | "food" | "weather" | "place";
}

interface KnowledgeBase {
  history: Record<string, string>;
  places: Record<string, string>;
  food: Record<string, string>;
  routes: Record<string, string>;
  practical: Record<string, string>;
  culture: Record<string, string>;
  festivals: Record<string, string>;
}

// Extensive knowledge base about Real del Monte
const knowledgeBase: KnowledgeBase = {
  history: {
    fundacion: "Real del Monte fue fundado en 1560 después del descubrimiento de ricos yacimientos de plata por Juan de Zúñiga y Juan de la Cruz. Fue uno de los distritos mineros más importantes de la Nueva España.",
    cornish: "En 1824 llegaron más de 3,000 mineros de Cornualles, Inglaterra, trayendo tecnología minera avanzada y dejando una huella cultural única. Es la única comunidad cornish en América Latina.",
    minas: "Las minas de Acosta, Dificultad, San Cayetano y Dolores produjeron toneladas de plata durante más de 400 años. La Mina de Acosta tiene 460 metros de profundidad.",
    panteon: "El Panteón Inglés, consagrado en 1900, es el cementerio anglicano más alto del mundo a 2,700 metros sobre el nivel del mar. Alberga tumbas desde 1830.",
    pueblo_magico: "Real del Monte fue nombrado Pueblo Mágico en 2004 por su importancia histórica, cultural y arquitectónica única."
  },
  
  places: {
    mina_acosta: "La Mina de Acosta es la más famosa del pueblo. Puedes descender 460 metros bajo tierra en un recorrido de 2 horas. Costo aproximado: $150-200 MXN. Horario: 10:00 a 17:00 hrs.",
    panteon_ingles: "El Panteón Inglés es un cementerio victoriano único con vistas panorámicas. Especialmente hermoso al atardecer y durante el Día de Muertos. Entrada libre.",
    plaza_principal: "La Plaza Principal es el corazón del pueblo desde 1560. Aquí encuentras el Kiosco de la Independencia y la Parroquia de la Asunción del siglo XVIII.",
    penas_cargadas: "Las Peñas Cargadas son formaciones rocosas gigantes en equilibrio aparentemente imposible. Ideal para senderismo y fotografía. A 15 minutos caminando del centro.",
    museo_paste: "El Museo del Paste es el único en México dedicado a este platillo. Muestra la historia, utensilios y evolución del paste desde 1824."
  },

  food: {
    paste: "El paste es el platillo emblemático de Real del Monte. Fue traído por los mineros cornish en 1824. Existen más de 50 variedades: papa con carne (tradicional), mole, frijol, atún, pollo chipotle, dulce de piña...",
    historia_paste: "El paste original (Cornish Pasty) era el almuerzo de los mineros. Su borde grueso servía como 'manija' para comer sin ensuciar las manos de carbón.",
    donde_comer: "Puedes encontrar pastes en pastelerías tradicionales del centro histórico. Las familias pastelesas más antiguas tienen más de 5 generaciones de tradición.",
    festival_paste: "El Festival Internacional del Paste se celebra el segundo fin de semana de octubre. Reúne a más de 50 expositores y atrae a 50,000 visitantes.",
    otros_platos: "Otros platillos típicos incluyen: guisos mineros, truchas al ajillo (de granjas locales), barbacoa estilo Hidalgo, quesos de vaso y dulces como obleas de gajeta."
  },

  routes: {
    historica: "La Ruta Histórica dura 3-4 horas e incluye: Plaza Principal → Museo de Medicina Laboral → Casa de la Cultura → Mina de Acosta → Panteón Inglés. Precio con guía: $150-200 MXN.",
    senderismo: "La Ruta de Senderismo va al Mirador La Cruz → Bosque de Oyamel → Peñas Cargadas → Manantial de San Antonio. Dura 4-5 horas, nivel moderado.",
    ecoturistica: "Ruta Ecoturística incluye vivero comunitario, reforestación, sendero de interpretación ambiental y observación de aves. Dura 5-6 horas.",
    aventura: "Ruta de Aventura: tirolesa de 400m, escalada en roca, rappel de 30m en Peñas Cargadas y cañonismo. Precio: $800-1,200 MXN.",
    gastronomica: "Ruta Gastronómica: desayuno tradicional → taller de paste → recorrido de pastelerías → Museo del Paste → comida minera → dulces típicos. Precio: $600-800 MXN.",
    cervecera: "Ruta Cervecera visita 4 cervecerías artesanales con degustaciones. Conoce la historia cervecera cornish. Solo mayores de 18 años. Precio: $500-700 MXN."
  },

  practical: {
    clima: "Real del Monte está a 2,700 metros de altitud. El clima es fresco todo el año (12-22°C). Lleva chamarra incluso en verano. La neblina es común (180+ días al año).",
    como_llegar: "Desde CDMX: Autopista México-Pachuca (1.5 hrs), luego carretera a Real del Monte (30 min). Desde Pachuca: 30 min por carretera libre.",
    estacionamiento: "Hay estacionamiento público en la Plaza Principal y en las entradas a las minas. Costo: $20-40 MXN por día.",
    hospedaje: "El pueblo ofrece desde hostales económicos ($300-500/noche) hasta hoteles boutique en casonas coloniales ($1,000-2,500/noche).",
    seguridad: "Real del Monte es muy seguro. Es un destino turístico tranquilo. Precauciones normales de viaje aplican.",
    dinero: "La mayoría de establecimientos aceptan tarjetas, pero lleva efectivo para compras pequeñas, estacionamientos y propinas. Hay cajeros en el centro."
  },

  culture: {
    tradiciones: "Principales tradiciones: Festival del Paste (octubre), Día de Muertos en Panteón Inglés (noviembre), Semana Santa Minera (marzo/abril), Festival Cornish-Mexicano (julio).",
    musica: "Las bandas de viento son tradicionales de las celebraciones. También existen coros cornish que cantan en inglés y español.",
    arquitectura: "El Centro Histórico tiene 12 manzanas protegidas por el INAH. Combina arquitectura colonial española con influencias victorianas inglesas.",
    religion: "Existe un único sincretismo religioso: católicos y anglicanos comparten el espacio. El Panteón Inglés tiene servicios anglicanos regulares.",
    deportes: "Real del Monte fue donde se jugó el primer partido de fútbol en México (1900), traído por los ingleses. También introdujeron el rugby y la lucha greco-romana."
  },

  festivals: {
    paste_festival: "Festival Internacional del Paste: Segundo fin de semana de octubre. Concurso de pastes, música, desfile, coronación de reina.",
    dia_muertos: "Día de Muertos en Panteón Inglés: 1-2 de noviembre. Única fusión de tradiciones mexicanas y anglicanas. Velas, flores, misa bilingüe.",
    semana_santa: "Semana Santa Minera: Procesión del Silencio con túnicas de mineros, Cruz de Plata, representaciones teatrales.",
    feria_plata: "Feria de la Plata: Agosto. Exposición de minerales, joyería, conferencias, fuegos artificiales desde la mina.",
    cornish: "Festival Cornish-Mexicano: Julio. Desfile de las Dos Naciones, música celta, rugby, cena de pasties.",
    navidad: "Navidad: Posadas tradicionales, piñatas, villancicos bilingües en algunas iglesias."
  }
};

// Quick suggestions
const suggestions = [
  "¿Qué hacer con 2 horas libres?",
  "Ruta histórica recomendada",
  "Historia del paste",
  "Cómo llegar desde CDMX",
  "Mejor época para visitar",
  "Festivales del año",
  "Dónde comer paste",
  "Qué llevar en la maleta",
];

// Sound effects (using Web Audio API)
const playNotificationSound = (type: "message" | "success" | "error") => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === "message") {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === "success") {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    }
  } catch (e) {
    // Audio not supported
  }
};

// Generate contextual response
function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  
  // History queries
  if (lower.includes("historia") || lower.includes("fundación") || lower.includes("cuando se fundó")) {
    if (lower.includes("cornish") || lower.includes("ingleses") || lower.includes("británicos")) {
      return knowledgeBase.history.cornish;
    }
    if (lower.includes("mina") || lower.includes("plata")) {
      return knowledgeBase.history.minas;
    }
    if (lower.includes("panteón") || lower.includes("cementerio")) {
      return knowledgeBase.history.panteon;
    }
    return knowledgeBase.history.fundacion + " " + knowledgeBase.history.pueblo_magico;
  }
  
  // Places queries
  if (lower.includes("mina") && lower.includes("acosta")) {
    return knowledgeBase.places.mina_acosta;
  }
  if (lower.includes("panteón") || lower.includes("cementerio inglés")) {
    return knowledgeBase.places.panteon_ingles;
  }
  if (lower.includes("plaza")) {
    return knowledgeBase.places.plaza_principal;
  }
  if (lower.includes("peñas") || lower.includes("peñas cargadas")) {
    return knowledgeBase.places.penas_cargadas;
  }
  if (lower.includes("museo") && lower.includes("paste")) {
    return knowledgeBase.places.museo_paste;
  }
  if (lower.includes("qué ver") || lower.includes("lugares") || lower.includes("atractivos")) {
    return "Los lugares imperdibles son: la Mina de Acosta (puedes bajar 460m), el Panteón Inglés (único en México), la Plaza Principal, las Peñas Cargadas (formaciones rocosas) y el Museo del Paste. ¿Te gustaría más información sobre alguno?";
  }
  
  // Food queries
  if (lower.includes("paste") && (lower.includes("historia") || lower.includes("origen"))) {
    return knowledgeBase.food.historia_paste + " " + knowledgeBase.food.paste;
  }
  if (lower.includes("paste") && lower.includes("dónde")) {
    return knowledgeBase.food.donde_comer;
  }
  if (lower.includes("paste") && lower.includes("festival")) {
    return knowledgeBase.food.festival_paste;
  }
  if (lower.includes("paste")) {
    return knowledgeBase.food.paste;
  }
  if (lower.includes("comer") || lower.includes("comida") || lower.includes("restaurante")) {
    return knowledgeBase.food.paste + " Además: " + knowledgeBase.food.otros_platos;
  }
  
  // Routes queries
  if (lower.includes("ruta") && lower.includes("histórica")) {
    return knowledgeBase.routes.historica;
  }
  if (lower.includes("ruta") && lower.includes("senderismo")) {
    return knowledgeBase.routes.senderismo;
  }
  if (lower.includes("ruta") && lower.includes("ecoturismo")) {
    return knowledgeBase.routes.ecoturistica;
  }
  if (lower.includes("ruta") && lower.includes("aventura")) {
    return knowledgeBase.routes.aventura;
  }
  if (lower.includes("ruta") && lower.includes("gastronómica")) {
    return knowledgeBase.routes.gastronomica;
  }
  if (lower.includes("ruta") && lower.includes("cervecera")) {
    return knowledgeBase.routes.cervecera;
  }
  if (lower.includes("ruta") || lower.includes("rutas")) {
    return "Ofrecemos 6 rutas turísticas: Histórica (3-4 hrs), Senderismo (4-5 hrs), Ecoturística (5-6 hrs), Aventura (tirolesa, escalada), Gastronómica (degustaciones) y Cervecera (artesanal). ¿Cuál te interesa más?";
  }
  
  // Practical queries
  if (lower.includes("clima") || lower.includes("tiempo") || lower.includes("temperatura")) {
    return knowledgeBase.practical.clima;
  }
  if (lower.includes("cómo llegar") || lower.includes("desde cdmx") || lower.includes("desde méxico") || lower.includes("desde pachuca")) {
    return knowledgeBase.practical.como_llegar;
  }
  if (lower.includes("estacionamiento")) {
    return knowledgeBase.practical.estacionamiento;
  }
  if (lower.includes("hospedaje") || lower.includes("hotel") || lower.includes("dónde dormir")) {
    return knowledgeBase.practical.hospedaje;
  }
  if (lower.includes("seguro") || lower.includes("seguridad")) {
    return knowledgeBase.practical.seguridad;
  }
  if (lower.includes("dinero") || lower.includes("efectivo") || lower.includes("tarjeta")) {
    return knowledgeBase.practical.dinero;
  }
  if (lower.includes("2 horas") || lower.includes("poco tiempo") || lower.includes("rápido")) {
    return "Con 2 horas te sugiero: 1) Plaza Principal y Parroquia (20 min), 2) Caminar calles coloniales (30 min), 3) Comer un paste (20 min), 4) Panteón Inglés (30 min). ¡Experiencia compacta pero completa!";
  }
  
  // Culture queries
  if (lower.includes("tradición") || lower.includes("costumbre")) {
    return knowledgeBase.culture.tradiciones;
  }
  if (lower.includes("música") || lower.includes("banda")) {
    return knowledgeBase.culture.musica;
  }
  if (lower.includes("arquitectura")) {
    return knowledgeBase.culture.arquitectura;
  }
  if (lower.includes("religión") || lower.includes("iglesia")) {
    return knowledgeBase.culture.religion;
  }
  if (lower.includes("fútbol") || lower.includes("deporte")) {
    return knowledgeBase.culture.deportes;
  }
  
  // Festivals queries
  if (lower.includes("festival") && lower.includes("paste")) {
    return knowledgeBase.festivals.paste_festival;
  }
  if (lower.includes("día de muertos") || lower.includes("muertos")) {
    return knowledgeBase.festivals.dia_muertos;
  }
  if (lower.includes("semana santa")) {
    return knowledgeBase.festivals.semana_santa;
  }
  if (lower.includes("feria") && lower.includes("plata")) {
    return knowledgeBase.festivals.feria_plata;
  }
  if (lower.includes("festival") && lower.includes("cornish")) {
    return knowledgeBase.festivals.cornish;
  }
  if (lower.includes("festivales") || lower.includes("eventos") || lower.includes("celebraciones")) {
    return "Los principales festivales son: Festival del Paste (octubre), Día de Muertos en Panteón Inglés (noviembre), Semana Santa Minera (marzo/abril), Feria de la Plata (agosto) y Festival Cornish-Mexicano (julio). ¿Quieres saber más de alguno?";
  }
  
  // Best time to visit
  if (lower.includes("cuándo ir") || lower.includes("mejor época") || lower.includes("temporada")) {
    return "Puedes visitar todo el año. La primavera (marzo-mayo) tiene el clima más agradable. Octubre es ideal por el Festival del Paste. Noviembre por el Día de Muertos. Evita solo días de lluvia intensa (julio-agosto) si planeas senderismo.";
  }
  
  // Help
  if (lower.includes("ayuda") || lower.includes("qué puedes hacer") || lower.includes("capacidades")) {
    return "Puedo ayudarte con: historia del pueblo, lugares para visitar, rutas turísticas, información sobre pastes y gastronomía, eventos y festivales, clima y consejos prácticos, cómo llegar y dónde hospedarte. ¿Sobre qué te gustaría saber?";
  }
  
  // Greetings
  if (lower.includes("hola") || lower.includes("buenos días") || lower.includes("buenas")) {
    return "¡Hola! Soy REALITO, tu guía experto de Real del Monte. 🏔️ Puedo ayudarte con información sobre historia, lugares, gastronomía, rutas turísticas, eventos y consejos prácticos. ¿Qué te gustaría saber?";
  }
  
  // Gratitude
  if (lower.includes("gracias") || lower.includes("thank")) {
    return "¡De nada! Es un placer ayudarte a descubrir Real del Monte. ¿Hay algo más en lo que pueda asistirte? 😊";
  }
  
  // Default response
  return "Lo siento, no tengo información específica sobre eso. Puedo ayudarte con: historia del pueblo, lugares turísticos, rutas, gastronomía (especialmente pastes), eventos, clima y consejos prácticos. ¿Te gustaría saber sobre alguno de estos temas?";
}

export default function RealitoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: text,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowSuggestions(false);

    // Simulate thinking time based on message complexity
    const thinkingTime = 800 + Math.random() * 600;
    await new Promise((r) => setTimeout(r, thinkingTime));

    const response = generateResponse(text);
    
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      content: response,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
    
    if (soundEnabled) {
      playNotificationSound("message");
    }
  }, [soundEnabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(18,45%,48%), hsl(43,65%,52%))" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div 
              key="close" 
              initial={{ rotate: -90, opacity: 0 }} 
              animate={{ rotate: 0, opacity: 1 }} 
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div 
              key="open" 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Notification dot */}
        {!isOpen && messages.length === 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl border border-border bg-background flex flex-col overflow-hidden"
            style={{ height: 600, maxHeight: "80vh" }}
          >
            {/* Header */}
            <div 
              className="flex items-center gap-3 px-4 py-3 border-b border-border"
              style={{ background: "linear-gradient(135deg, hsl(18,45%,48%), hsl(43,65%,52%))" }}
            >
              <div className="relative">
                <img src={logoRdm} alt="REALITO" className="w-10 h-10 rounded-full bg-white/20 object-contain p-0.5" />
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">REALITO</h3>
                <p className="text-white/70 text-[11px]">Guía experto de Real del Monte</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-white/70" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white/70" />
                  )}
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Limpiar conversación"
                  >
                    <Sparkles className="w-4 h-4 text-white/70" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 && showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-terracotta/20 to-gold/20 flex items-center justify-center">
                    <img src={logoRdm} alt="REALITO" className="w-12 h-12 opacity-80" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-foreground mb-2">
                    ¡Hola! Soy REALITO
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4 px-4">
                    Tu guía experto de Real del Monte. Tengo información detallada sobre historia, 
                    lugares, rutas turísticas, gastronomía, eventos y consejos prácticos.
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Selecciona una pregunta o escribe la tuya:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center px-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                {messages.map((m) => (
                  <motion.div 
                    key={m.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta to-gold flex items-center justify-center mr-2 shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {m.content.split("**").map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : <span key={i}>{part}</span>
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ml-2 shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta to-gold flex items-center justify-center mr-2 shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
                      <motion.div 
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/50" 
                      />
                      <motion.div 
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/50" 
                      />
                      <motion.div 
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/50" 
                      />
                    </div>
                  </motion.div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/30">
              {showSuggestions && messages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                  {suggestions.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1 rounded-full text-xs bg-background border border-border hover:border-primary/50 transition-colors whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-terracotta to-gold hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                REALITO es un asistente de IA con conocimiento sobre Real del Monte
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
