-- TAMV Core knowledge graph foundation on PostgreSQL + pgvector.
-- Includes: taxonomy, nodes, edges, documents, chunks, traceability, and seed data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1) Node taxonomy
CREATE TABLE IF NOT EXISTS public.node_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Main knowledge nodes
CREATE TABLE IF NOT EXISTS public.nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  type_code TEXT NOT NULL REFERENCES public.node_types(code),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'vision')),
  importance INT NOT NULL DEFAULT 50 CHECK (importance BETWEEN 0 AND 100),
  source_doc_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Relation taxonomy to keep graph consistent and queryable
CREATE TABLE IF NOT EXISTS public.relation_types (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Graph edges between nodes
CREATE TABLE IF NOT EXISTS public.edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  from_node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL REFERENCES public.relation_types(code),
  strength NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (strength BETWEEN 0.00 AND 1.00),
  rationale TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_node_id, to_node_id, relation_type)
);

-- 5) Source documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'raw',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) Chunked document segments for extraction and semantic retrieval
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  node_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

-- 7) Sources and traceability metadata
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  locator TEXT,
  reliability_score NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (reliability_score BETWEEN 0.00 AND 1.00),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8) Tags and node-tag relationships
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.node_tags (
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, tag_id)
);

-- Add late FK to avoid table creation order issues
ALTER TABLE public.nodes
  DROP CONSTRAINT IF EXISTS nodes_source_doc_id_fkey,
  ADD CONSTRAINT nodes_source_doc_id_fkey
    FOREIGN KEY (source_doc_id)
    REFERENCES public.documents(id)
    ON DELETE SET NULL;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_nodes_project_type ON public.nodes(project_code, type_code);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON public.nodes(status);
CREATE INDEX IF NOT EXISTS idx_nodes_metadata ON public.nodes USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_edges_from_node ON public.edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_to_node ON public.edges(to_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_relation_type ON public.edges(relation_type);
CREATE INDEX IF NOT EXISTS idx_documents_project_type ON public.documents(project_code, doc_type);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);

-- Optional ANN indexes for pgvector (cosine distance)
CREATE INDEX IF NOT EXISTS idx_nodes_embedding_cosine
  ON public.nodes USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_cosine
  ON public.document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nodes_updated_at ON public.nodes;
CREATE TRIGGER trg_nodes_updated_at
BEFORE UPDATE ON public.nodes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Seed node types
INSERT INTO public.node_types (code, label, description)
VALUES
  ('identity', 'Identidad', 'Personas, roles, firmas, figuras simbólicas'),
  ('concept', 'Concepto', 'Ideas, principios, marcos y definiciones'),
  ('system', 'Sistema', 'Subsistemas y plataformas principales'),
  ('asset', 'Activo', 'NFT, producto, servicio o recurso'),
  ('process', 'Proceso', 'Secuencia operativa o flujo de trabajo'),
  ('protocol', 'Protocolo', 'Reglas, normas, procedimientos de seguridad'),
  ('territory', 'Territorio', 'Lugar físico, digital o nodal'),
  ('document', 'Documento', 'Fuente textual maestra o derivada'),
  ('event', 'Evento', 'Hito, lanzamiento, fecha o suceso'),
  ('model', 'Modelo', 'Estructura económica, técnica o de gobernanza')
ON CONFLICT (code) DO NOTHING;

-- Seed relation types (includes recommended + graph starter verbs used below)
INSERT INTO public.relation_types (code, label, description)
VALUES
  ('defines', 'Define', 'Establece definición o marco de otro nodo'),
  ('represents', 'Representa', 'Expresa identidad o símbolo de otro nodo'),
  ('contains', 'Contiene', 'Incluye otro nodo como subsistema o parte'),
  ('depends_on', 'Depende de', 'Requiere capacidades de otro nodo'),
  ('connected_to', 'Conectado a', 'Vínculo general entre nodos'),
  ('governs', 'Gobierna', 'Regula o dirige otro nodo'),
  ('generates_value_for', 'Genera valor para', 'Aporta valor económico/cultural/técnico'),
  ('implemented_in', 'Implementado en', 'Se materializa en otro nodo'),
  ('evolves_into', 'Evoluciona en', 'Transición de versión o estado'),
  ('documents', 'Documenta', 'Aporta documentación sobre otro nodo'),
  ('is_same_as', 'Es equivalente a', 'Identidad legal/simbólica equivalente'),
  ('implements', 'Implementa', 'Implementa funcionalmente otro nodo'),
  ('embodies', 'Encarna', 'Expresa principio central'),
  ('preserves', 'Preserva', 'Conserva memoria, patrimonio o estado')
ON CONFLICT (code) DO NOTHING;

-- Seed initial TAMV nodes
INSERT INTO public.nodes (type_code, slug, title, summary, status, importance, metadata)
VALUES
  ('system', 'tamv-core', 'TAMV Core', 'Núcleo cognitivo e institucional del ecosistema TAMV.', 'active', 100, '{"domain":"ecosystem","priority":100,"canonical":true,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('system', 'tamv-online-network', 'TAMV Online Network', 'Ecosistema digital y civilizatorio del proyecto TAMV.', 'active', 100, '{"domain":"network","priority":95,"canonical":true,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('identity', 'anubis-villasenor', 'Anubis Villaseñor', 'Figura simbólica y narrativa central del proyecto.', 'active', 95, '{"role":"Arquitecto Raíz","domain":"culture","priority":95,"canonical":true,"owner":"TAMV","created_by":"human"}'::jsonb),
  ('identity', 'edwin-oswaldo-castillo-trejo', 'Edwin Oswaldo Castillo Trejo', 'Nombre legal asociado al Arquitecto Raíz.', 'active', 90, '{"role":"Fundador","domain":"culture","priority":90,"canonical":true,"owner":"TAMV","created_by":"human"}'::jsonb),
  ('document', 'manifiesto-tamv', 'Manifiesto TAMV', 'Documento rector de visión, propósito y principios.', 'active', 100, '{"doc_kind":"manifesto","domain":"civilization","priority":100,"canonical":true,"owner":"TAMV","created_by":"human"}'::jsonb),
  ('model', 'md-x4', 'MD-X4', 'Arquitectura de 7 capas civilizatorias y técnicas.', 'active', 98, '{"layers":7,"domain":"tech","priority":98,"canonical":true,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('concept', 'territorio-autonomo-de-memoria-viva', 'Territorio Autónomo de Memoria Viva', 'Definición conceptual del TAMV.', 'active', 100, '{"type":"canonical_definition","domain":"civilization","priority":100,"canonical":true,"owner":"TAMV","created_by":"human"}'::jsonb),
  ('system', 'utamv', 'UTAMV', 'Universidad del ecosistema TAMV.', 'vision', 92, '{"domain":"education","priority":92,"canonical":false,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('territory', 'rdm-digital', 'RDM Digital', 'Nodo territorial del proyecto en Real del Monte.', 'active', 95, '{"location":"Real del Monte, México","domain":"territory","priority":95,"canonical":true,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('system', 'isabella-ia', 'Isabella IA', 'Sistema de inteligencia ética y asistencia cognitiva.', 'active', 96, '{"role":"ethical_ai","domain":"tech","priority":96,"canonical":true,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('protocol', 'tenochtitlan-security', 'Sistema TENOCHTITLAN', 'Arquitectura de seguridad, vigilancia y antifraude.', 'active', 94, '{"domain":"security","priority":94,"canonical":true,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('asset', 'nft-el-regalo-del-alma', 'NFT El Regalo del Alma', 'Colección o activo simbólico y económico del ecosistema.', 'vision', 85, '{"asset_type":"nft","domain":"economy","priority":85,"canonical":false,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('model', 'fairsplit', 'FairSplit', 'Modelo de distribución económica y monetización justa.', 'active', 90, '{"domain":"economics","priority":90,"canonical":true,"owner":"TAMV","created_by":"mixed"}'::jsonb),
  ('concept', 'soberania-digital', 'Soberanía Digital', 'Principio rector de control, autonomía y memoria.', 'active', 98, '{"category":"principle","domain":"civilization","priority":98,"canonical":true,"owner":"TAMV","created_by":"human"}'::jsonb),
  ('concept', 'memoria-historica', 'Memoria Histórica', 'Preservación y activación de identidad y territorio.', 'active', 97, '{"category":"cultural","domain":"culture","priority":97,"canonical":true,"owner":"TAMV","created_by":"human"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Seed initial TAMV edges
WITH n AS (
  SELECT slug, id FROM public.nodes
)
INSERT INTO public.edges (from_node_id, to_node_id, relation_type, strength, rationale, metadata)
SELECT a.id, b.id, 'defines', 1.0, 'Nodo rector define al ecosistema', '{"confidence":1.0,"created_by":"human","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'manifiesto-tamv' AND b.slug = 'tamv-core'

UNION ALL
SELECT a.id, b.id, 'represents', 1.0, 'Figura simbólica central del proyecto', '{"confidence":1.0,"created_by":"human","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'anubis-villasenor' AND b.slug = 'tamv-core'

UNION ALL
SELECT a.id, b.id, 'is_same_as', 1.0, 'Nombre legal asociado al Arquitecto Raíz', '{"confidence":1.0,"created_by":"human","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'edwin-oswaldo-castillo-trejo' AND b.slug = 'anubis-villasenor'

UNION ALL
SELECT a.id, b.id, 'implements', 1.0, 'Arquitectura operativa del sistema', '{"confidence":0.95,"created_by":"mixed","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'md-x4' AND b.slug = 'tamv-core'

UNION ALL
SELECT a.id, b.id, 'contains', 1.0, 'UTAMV como subsistema', '{"confidence":0.9,"created_by":"mixed","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'utamv'

UNION ALL
SELECT a.id, b.id, 'contains', 1.0, 'RDM Digital como nodo territorial', '{"confidence":0.95,"created_by":"mixed","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'rdm-digital'

UNION ALL
SELECT a.id, b.id, 'contains', 1.0, 'Isabella IA como subsistema cognitivo', '{"confidence":0.95,"created_by":"mixed","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'isabella-ia'

UNION ALL
SELECT a.id, b.id, 'depends_on', 0.9, 'Seguridad base del ecosistema', '{"confidence":0.9,"created_by":"mixed","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'tenochtitlan-security'

UNION ALL
SELECT a.id, b.id, 'generates_value_for', 0.9, 'Modelo económico del ecosistema', '{"confidence":0.9,"created_by":"mixed","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'fairsplit' AND b.slug = 'tamv-core'

UNION ALL
SELECT a.id, b.id, 'embodies', 1.0, 'Principio rector de autonomía', '{"confidence":1.0,"created_by":"human","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'soberania-digital' AND b.slug = 'tamv-core'

UNION ALL
SELECT a.id, b.id, 'preserves', 1.0, 'Memoria como base del ecosistema', '{"confidence":1.0,"created_by":"human","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'memoria-historica' AND b.slug = 'tamv-core'

UNION ALL
SELECT a.id, b.id, 'generates_value_for', 0.8, 'Activo económico y simbólico', '{"confidence":0.85,"created_by":"mixed","review_status":"pending"}'::jsonb
FROM n a, n b
WHERE a.slug = 'nft-el-regalo-del-alma' AND b.slug = 'tamv-core'

UNION ALL
SELECT a.id, b.id, 'contains', 1.0, 'Núcleo TAMV contiene la red online', '{"confidence":0.95,"created_by":"mixed","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'tamv-online-network'

UNION ALL
SELECT a.id, b.id, 'documents', 1.0, 'Manifiesto documenta el núcleo', '{"confidence":1.0,"created_by":"human","review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'manifiesto-tamv' AND b.slug = 'tamv-core'
ON CONFLICT (from_node_id, to_node_id, relation_type) DO NOTHING;
