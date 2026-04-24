-- TAMV Knowledge Graph MVP (PostgreSQL + pgvector)
-- Ejecutar después de 001_kernel_civilizatorio_init.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1) Catálogos base
CREATE TABLE IF NOT EXISTS node_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relation_types (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  directional BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Fuentes y documentos
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  source_type TEXT NOT NULL, -- pdf | url | note | audio | interview
  title TEXT NOT NULL,
  locator TEXT,
  reliability_score NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL, -- README | manifiesto | blueprint | entrevista | nota | pdf
  content TEXT NOT NULL,
  source_id UUID NULL REFERENCES sources(id) ON DELETE SET NULL,
  source_url TEXT,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'raw',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Nodos y relaciones
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  type_code TEXT NOT NULL REFERENCES node_types(code),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | active | archived | vision
  importance INT NOT NULL DEFAULT 50 CHECK (importance BETWEEN 0 AND 100),
  source_doc_id UUID NULL REFERENCES documents(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL DEFAULT 'TAMV',
  from_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL REFERENCES relation_types(code),
  strength NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (strength >= 0 AND strength <= 1),
  rationale TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_node_id, to_node_id, relation_type)
);

CREATE TABLE IF NOT EXISTS node_tags (
  node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, tag_id)
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  node_id UUID NULL REFERENCES nodes(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_nodes_project_type ON nodes(project_code, type_code);
CREATE INDEX IF NOT EXISTS idx_nodes_status_importance ON nodes(status, importance DESC);
CREATE INDEX IF NOT EXISTS idx_edges_from_to ON edges(from_node_id, to_node_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_idx ON document_chunks(document_id, chunk_index);

-- HNSW index para búsqueda semántica (ajustar operador según embeddings normalizados)
CREATE INDEX IF NOT EXISTS idx_nodes_embedding_hnsw ON nodes USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- Trigger genérico para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_set_updated_at ON documents;
CREATE TRIGGER trg_documents_set_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_nodes_set_updated_at ON nodes;
CREATE TRIGGER trg_nodes_set_updated_at
BEFORE UPDATE ON nodes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4) Taxonomía inicial
INSERT INTO node_types (code, label, description) VALUES
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

INSERT INTO relation_types (code, label, description, directional) VALUES
('defines', 'Define', 'Un nodo define otro nodo.', TRUE),
('represents', 'Representa', 'Un nodo representa otro nodo.', TRUE),
('contains', 'Contiene', 'Un nodo incluye otro como parte del sistema.', TRUE),
('depends_on', 'Depende de', 'Dependencia operacional o lógica.', TRUE),
('connected_to', 'Conectado con', 'Relación asociativa no jerárquica.', FALSE),
('governs', 'Gobierna', 'Marco rector sobre otro nodo.', TRUE),
('generates_value_for', 'Genera valor para', 'Relación económica o de impacto.', TRUE),
('implemented_in', 'Implementado en', 'Implementación técnica en otro nodo.', TRUE),
('evolves_into', 'Evoluciona a', 'Transformación temporal.', TRUE),
('documents', 'Documenta', 'Nodo que documenta otro nodo.', TRUE),
('is_same_as', 'Es el mismo que', 'Identidad equivalente.', FALSE),
('implements', 'Implementa', 'Nodo implementador de otro.', TRUE),
('embodies', 'Encarna', 'Principio encarnado por un sistema.', TRUE),
('preserves', 'Preserva', 'Conserva y protege otro nodo.', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 5) Núcleo inicial de nodos TAMV
INSERT INTO nodes (type_code, slug, title, summary, status, importance, metadata) VALUES
('system', 'tamv-core', 'TAMV Core', 'Núcleo cognitivo e institucional del ecosistema TAMV.', 'active', 100, '{"domain":"ecosystem","canonical":true}'),
('system', 'tamv-online-network', 'TAMV Online Network', 'Ecosistema digital y civilizatorio del proyecto TAMV.', 'active', 100, '{"domain":"network"}'),
('identity', 'anubis-villasenor', 'Anubis Villaseñor', 'Figura simbólica y narrativa central del proyecto.', 'active', 95, '{"role":"Arquitecto Raíz"}'),
('identity', 'edwin-oswaldo-castillo-trejo', 'Edwin Oswaldo Castillo Trejo', 'Nombre legal asociado al Arquitecto Raíz.', 'active', 90, '{"role":"Fundador"}'),
('document', 'manifiesto-tamv', 'Manifiesto TAMV', 'Documento rector de visión, propósito y principios.', 'active', 100, '{"doc_kind":"manifesto"}'),
('model', 'md-x4', 'MD-X4', 'Arquitectura de 7 capas civilizatorias y técnicas.', 'active', 98, '{"layers":7}'),
('concept', 'territorio-autonomo-de-memoria-viva', 'Territorio Autónomo de Memoria Viva', 'Definición conceptual del TAMV.', 'active', 100, '{"type":"canonical_definition"}'),
('system', 'utamv', 'UTAMV', 'Universidad del ecosistema TAMV.', 'vision', 92, '{"domain":"education"}'),
('territory', 'rdm-digital', 'RDM Digital', 'Nodo territorial del proyecto en Real del Monte.', 'active', 95, '{"location":"Real del Monte, México"}'),
('system', 'isabella-ia', 'Isabella IA', 'Sistema de inteligencia ética y asistencia cognitiva.', 'active', 96, '{"role":"ethical_ai"}'),
('protocol', 'tenochtitlan-security', 'Sistema TENOCHTITLAN', 'Arquitectura de seguridad, vigilancia y antifraude.', 'active', 94, '{"domain":"security"}'),
('asset', 'nft-el-regalo-del-alma', 'NFT El Regalo del Alma', 'Colección o activo simbólico y económico del ecosistema.', 'vision', 85, '{"asset_type":"nft"}'),
('model', 'fairsplit', 'FairSplit', 'Modelo de distribución económica y monetización justa.', 'active', 90, '{"domain":"economics"}'),
('concept', 'soberania-digital', 'Soberanía Digital', 'Principio rector de control, autonomía y memoria.', 'active', 98, '{"category":"principle"}'),
('concept', 'memoria-historica', 'Memoria Histórica', 'Preservación y activación de identidad y territorio.', 'active', 97, '{"category":"cultural"}')
ON CONFLICT (slug) DO NOTHING;

-- 6) Relaciones iniciales
WITH n AS (
  SELECT slug, id FROM nodes
)
INSERT INTO edges (from_node_id, to_node_id, relation_type, strength, rationale, metadata)
SELECT a.id, b.id, 'defines', 1.0, 'Nodo rector define al ecosistema', '{"confidence":1.0,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'manifiesto-tamv' AND b.slug = 'tamv-core'
UNION ALL
SELECT a.id, b.id, 'represents', 1.0, 'Figura simbólica central del proyecto', '{"confidence":1.0,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'anubis-villasenor' AND b.slug = 'tamv-core'
UNION ALL
SELECT a.id, b.id, 'is_same_as', 1.0, 'Nombre legal asociado al Arquitecto Raíz', '{"confidence":1.0,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'edwin-oswaldo-castillo-trejo' AND b.slug = 'anubis-villasenor'
UNION ALL
SELECT a.id, b.id, 'implements', 1.0, 'Arquitectura operativa del sistema', '{"confidence":1.0,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'md-x4' AND b.slug = 'tamv-core'
UNION ALL
SELECT a.id, b.id, 'contains', 1.0, 'UTAMV como subsistema', '{"confidence":0.95,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'utamv'
UNION ALL
SELECT a.id, b.id, 'contains', 1.0, 'RDM Digital como nodo territorial', '{"confidence":0.95,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'rdm-digital'
UNION ALL
SELECT a.id, b.id, 'contains', 1.0, 'Isabella IA como subsistema cognitivo', '{"confidence":0.95,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'isabella-ia'
UNION ALL
SELECT a.id, b.id, 'depends_on', 0.9, 'Seguridad base del ecosistema', '{"confidence":0.90,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'tamv-core' AND b.slug = 'tenochtitlan-security'
UNION ALL
SELECT a.id, b.id, 'generates_value_for', 0.9, 'Modelo económico del ecosistema', '{"confidence":0.90,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'fairsplit' AND b.slug = 'tamv-core'
UNION ALL
SELECT a.id, b.id, 'embodies', 1.0, 'Principio rector de autonomía', '{"confidence":1.0,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'soberania-digital' AND b.slug = 'tamv-core'
UNION ALL
SELECT a.id, b.id, 'preserves', 1.0, 'Memoria como base del ecosistema', '{"confidence":1.0,"review_status":"approved"}'::jsonb
FROM n a, n b
WHERE a.slug = 'memoria-historica' AND b.slug = 'tamv-core'
UNION ALL
SELECT a.id, b.id, 'generates_value_for', 0.8, 'Activo económico y simbólico', '{"confidence":0.80,"review_status":"pending"}'::jsonb
FROM n a, n b
WHERE a.slug = 'nft-el-regalo-del-alma' AND b.slug = 'tamv-core'
ON CONFLICT (from_node_id, to_node_id, relation_type) DO NOTHING;
