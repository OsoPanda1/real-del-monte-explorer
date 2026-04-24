export interface RealitoKnowledgePoint {
  id: string;
  name: string;
  category: "historia" | "cultura" | "gastronomia" | "naturaleza" | "servicios";
  description: string;
  coordinates: { lat: number; lng: number };
  visitWindow: string;
  tags: string[];
}

export interface RealitoKnowledgeRoute {
  id: string;
  name: string;
  duration: string;
  focus: string;
  highlights: string[];
}

export interface RealitoKnowledgeFact {
  id: string;
  title: string;
  detail: string;
  sourceType: "patrimonio" | "tradicion" | "turismo";
}

export interface RealtimeMapSnapshot {
  updatedAt: string;
  activeVisitors: number;
  weatherNote: string;
  highlightedZones: string[];
  recommendations: string[];
}

export const realitoKnowledgeLibrary = {
  points: [
    {
      id: "mina-acosta",
      name: "Mina de Acosta",
      category: "historia",
      description: "Recorrido histórico por uno de los complejos mineros más representativos de Real del Monte.",
      coordinates: { lat: 20.141, lng: -98.672 },
      visitWindow: "09:00 - 17:00",
      tags: ["minería", "patrimonio", "guías locales"],
    },
    {
      id: "panteon-ingles",
      name: "Panteón Inglés",
      category: "cultura",
      description: "Espacio histórico rodeado de bosque con gran valor simbólico para la memoria local.",
      coordinates: { lat: 20.1445, lng: -98.678 },
      visitWindow: "10:00 - 18:00",
      tags: ["cultura", "historia", "arquitectura"],
    },
    {
      id: "museo-paste",
      name: "Museo del Paste",
      category: "gastronomia",
      description: "Centro interpretativo de la tradición gastronómica del paste en el municipio.",
      coordinates: { lat: 20.1375, lng: -98.674 },
      visitWindow: "10:00 - 18:00",
      tags: ["paste", "tradición", "familias"],
    },
    {
      id: "penas-cargadas",
      name: "Peñas Cargadas",
      category: "naturaleza",
      description: "Zona natural ideal para senderismo y actividades de aventura con panorámicas de altura.",
      coordinates: { lat: 20.15, lng: -98.66 },
      visitWindow: "08:00 - 17:30",
      tags: ["ecoturismo", "naturaleza", "aventura"],
    },
    {
      id: "plaza-principal",
      name: "Plaza Principal",
      category: "servicios",
      description: "Punto central para iniciar recorridos, eventos culturales y orientación turística.",
      coordinates: { lat: 20.138, lng: -98.6735 },
      visitWindow: "Todo el día",
      tags: ["orientación", "eventos", "centro"],
    },
  ] as RealitoKnowledgePoint[],
  routes: [
    {
      id: "ruta-historica",
      name: "Ruta Minera Histórica",
      duration: "3-4 horas",
      focus: "patrimonio y memoria",
      highlights: ["Mina de Acosta", "Panteón Inglés", "Centro Histórico"],
    },
    {
      id: "ruta-sabor",
      name: "Ruta del Paste y Sabores Locales",
      duration: "2-3 horas",
      focus: "gastronomía",
      highlights: ["Museo del Paste", "Pasterías tradicionales", "Cafés de altura"],
    },
    {
      id: "ruta-natural",
      name: "Ruta Bosque y Miradores",
      duration: "4-5 horas",
      focus: "naturaleza y aventura",
      highlights: ["Peñas Cargadas", "Senderos", "Miradores"],
    },
  ] as RealitoKnowledgeRoute[],
  facts: [
    {
      id: "fact-paste",
      title: "Cuna del paste en México",
      detail: "La tradición del paste forma parte central de la identidad gastronómica de Real del Monte.",
      sourceType: "tradicion",
    },
    {
      id: "fact-mineria",
      title: "Legado minero de alcance nacional",
      detail: "La historia local está profundamente conectada con la minería de plata y su patrimonio industrial.",
      sourceType: "patrimonio",
    },
    {
      id: "fact-pueblo-magico",
      title: "Destino turístico de alto valor cultural",
      detail: "Real del Monte destaca por su arquitectura, cultura y paisajes de montaña en Hidalgo.",
      sourceType: "turismo",
    },
  ] as RealitoKnowledgeFact[],
};

export const getRealitoKnowledgeStats = () => ({
  points: realitoKnowledgeLibrary.points.length,
  routes: realitoKnowledgeLibrary.routes.length,
  facts: realitoKnowledgeLibrary.facts.length,
  categories: Array.from(new Set(realitoKnowledgeLibrary.points.map((p) => p.category))).length,
});

export const searchRealitoKnowledge = (query: string) => {
  const term = query.toLowerCase().trim();
  if (!term) return [];

  return realitoKnowledgeLibrary.points.filter((point) => {
    const text = `${point.name} ${point.description} ${point.tags.join(" ")}`.toLowerCase();
    return text.includes(term);
  });
};

export const getRealtimeMapSnapshot = (now = new Date()): RealtimeMapSnapshot => {
  const minute = now.getMinutes();
  const weatherByMinute = [
    "Niebla ligera en zonas altas",
    "Cielo parcialmente despejado",
    "Brisa fría en el centro histórico",
  ];

  const recommendations = [
    "Comienza por el centro y sube a rutas históricas antes del mediodía.",
    "Si hay neblina, prioriza museos y experiencias gastronómicas.",
    "Reserva tarde para miradores y caminatas de bosque.",
  ];

  return {
    updatedAt: now.toISOString(),
    activeVisitors: 120 + (minute % 35),
    weatherNote: weatherByMinute[minute % weatherByMinute.length],
    highlightedZones: [
      "Centro Histórico",
      minute % 2 === 0 ? "Mina de Acosta" : "Panteón Inglés",
      minute % 3 === 0 ? "Peñas Cargadas" : "Museo del Paste",
    ],
    recommendations: [recommendations[minute % recommendations.length]],
  };
};


export interface CommerceMentionPolicy {
  zone: string;
  maxMentionsPerFeed: number;
  cooldownMinutes: number;
  fairnessWeight: "balanced" | "premium-boost";
  notes: string;
}

export const commerceMentionPolicies: CommerceMentionPolicy[] = [
  {
    zone: "Centro Histórico",
    maxMentionsPerFeed: 3,
    cooldownMinutes: 90,
    fairnessWeight: "balanced",
    notes: "Evita saturación comercial y prioriza diversidad de giros por cuadra.",
  },
  {
    zone: "Corredor Minero",
    maxMentionsPerFeed: 2,
    cooldownMinutes: 120,
    fairnessWeight: "premium-boost",
    notes: "Da preferencia a experiencias guiadas certificadas y seguridad del visitante.",
  },
  {
    zone: "Bosque y Miradores",
    maxMentionsPerFeed: 2,
    cooldownMinutes: 120,
    fairnessWeight: "balanced",
    notes: "Mantiene foco ecoturístico, limitando promociones repetidas en naturaleza.",
  },
];
