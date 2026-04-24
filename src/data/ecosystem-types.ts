export type CategoryId =
  | "tamv"
  | "rdm"
  | "ai"
  | "web"
  | "backend"
  | "data"
  | "iot"
  | "av"
  | "security"
  | "devops"
  | "docs"
  | "community"
  | "experiment"
  | "other";

export interface EcosystemNode {
  id: string;
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  category: CategoryId;
  topics: string[];
  pushedAt: string;
  updatedAt: string;
  archived: boolean;
  fork: boolean;
}

export interface EcosystemEdge {
  source: string;
  target: string;
  weight: number;
}

export interface EcosystemGraph {
  user: string;
  generatedAt: string;
  total: number;
  counts: Record<CategoryId, number>;
  nodes: EcosystemNode[];
  edges: EcosystemEdge[];
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  color: string;
  description: string;
}

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  tamv: {
    id: "tamv",
    label: "TAMV Core",
    color: "hsl(210, 100%, 55%)",
    description: "Núcleo del ecosistema civilizatorio federado TAMV.",
  },
  rdm: {
    id: "rdm",
    label: "Real del Monte",
    color: "hsl(43, 80%, 55%)",
    description: "Nodos territoriales del Pueblo Mágico.",
  },
  ai: {
    id: "ai",
    label: "IA & Agentes",
    color: "hsl(280, 70%, 65%)",
    description: "Agentes, LLMs, asistentes y automatización.",
  },
  web: {
    id: "web",
    label: "Plataformas Web",
    color: "hsl(195, 90%, 55%)",
    description: "Portales, hubs, sitios y sistemas de diseño.",
  },
  backend: {
    id: "backend",
    label: "Backend & APIs",
    color: "hsl(160, 70%, 45%)",
    description: "Servicios, gateways y microservicios.",
  },
  data: {
    id: "data",
    label: "Datos & Investigación",
    color: "hsl(30, 85%, 55%)",
    description: "Datasets, analítica y producción científica.",
  },
  iot: {
    id: "iot",
    label: "IoT & Smart City",
    color: "hsl(140, 60%, 45%)",
    description: "Sensores, firmware y ciudad inteligente.",
  },
  av: {
    id: "av",
    label: "AVIXA & Media",
    color: "hsl(330, 70%, 55%)",
    description: "Audio/Video profesional, omniverso y broadcast.",
  },
  security: {
    id: "security",
    label: "Identidad & Soberanía",
    color: "hsl(0, 70%, 55%)",
    description: "Identidad, auth y soberanía digital.",
  },
  devops: {
    id: "devops",
    label: "DevOps & Deploy",
    color: "hsl(220, 20%, 55%)",
    description: "Infraestructura, CI/CD y despliegue.",
  },
  docs: {
    id: "docs",
    label: "Documentación",
    color: "hsl(50, 70%, 55%)",
    description: "Documentación, blogs y sistemas de contenido.",
  },
  community: {
    id: "community",
    label: "Comunidad & Redes",
    color: "hsl(260, 60%, 55%)",
    description: "Bots, redes sociales y herramientas comunitarias.",
  },
  experiment: {
    id: "experiment",
    label: "Laboratorio",
    color: "hsl(180, 60%, 50%)",
    description: "Prototipos, POCs y experimentación.",
  },
  other: {
    id: "other",
    label: "Sin clasificar",
    color: "hsl(220, 10%, 45%)",
    description: "Nodos por clasificar dentro del grafo.",
  },
};

export const CATEGORY_ORDER: CategoryId[] = [
  "tamv",
  "rdm",
  "ai",
  "web",
  "backend",
  "data",
  "av",
  "iot",
  "security",
  "devops",
  "docs",
  "community",
  "experiment",
  "other",
];
