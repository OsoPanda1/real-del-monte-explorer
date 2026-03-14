export type TamvModule = {
  name: string;
  description: string;
  stack: string[];
};

export type TamvProfile = {
  id: string;
  productName: string;
  version: string;
  objective: string;
  principles: string[];
  architecture: {
    layers: number;
    heads: number;
    embeddingDim: number;
    vocabularySize: number;
  };
  modules: TamvModule[];
};

export const ISABELLA_TAMV_PROFILE: TamvProfile = {
  id: "isabella-ai-tamv",
  productName: "ISABELLA AI™",
  version: "v4.0 Enterprise",
  objective:
    "Operar una IA autónoma con memoria episódica, trazabilidad criptográfica y despliegue enterprise bajo la experiencia REALITO.",
  principles: [
    "Independencia arquitectónica",
    "Privacidad y control de datos",
    "Seguridad por diseño (zero-trust)",
    "Mejora continua con feedback validado",
    "Contextualización cultural mexicana",
  ],
  architecture: {
    layers: 12,
    heads: 32,
    embeddingDim: 1024,
    vocabularySize: 50000,
  },
  modules: [
    {
      name: "TAMV Core Processor",
      description: "Pipeline E2E de tokenización, embeddings, inferencia y generación.",
      stack: ["TypeScript", "WebAssembly"],
    },
    {
      name: "Neural Memory Mesh",
      description: "Memoria episódica con búsqueda semántica y consolidación temporal.",
      stack: ["TypeScript", "PostgreSQL", "pgvector"],
    },
    {
      name: "Training Protocol",
      description:
        "Entrenamiento continuo con validación semántica/emocional y priorización de tareas.",
      stack: ["TypeScript"],
    },
    {
      name: "Audit & Compliance",
      description: "Registro inmutable con firma digital para trazabilidad regulatoria.",
      stack: ["TypeScript", "RSA-4096", "SHA3-512", "AES-256-GCM"],
    },
  ],
};

export const TAMV_CAPABILITIES_SUMMARY = [
  "Transformer híbrido multicapa",
  "Memoria episódica distribuida",
  "Auto-entrenamiento continuo",
  "Auditoría blockchain-like",
  "Seguridad end-to-end",
];
