/**
 * RDM Digital - Core Models GEN-7+
 * Sistema de Inteligencia Territorial en Tiempo Real
 * Unificado desde: rdm-smart-city-os, citemesh-roots, RDM-Digital-X
 */

// ============================================================================
// TIPOS BASE GEOESPACIALES
// ============================================================================

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// ============================================================================
// ESTADO DEL TURISTA
// ============================================================================

export interface TuristaEstado {
  id: string;
  territory?: string;
  coords: Coordenadas;
  prevCoords?: Coordenadas;
  stayTimeHours: number;
  activityTimestamps: {
    lastInteractionAt: Date;
    firstSeenAt?: Date;
    lastMovementAt?: Date;
  };
  metadata?: {
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    referrer?: string;
    sessionId?: string;
  };
}

// ============================================================================
// DECISIONES ISABELLA
// ============================================================================

export type DecisionLevel = 'CRITICO' | 'ALERTA' | 'INFO' | 'SUGERENCIA';
export type RetentionIntent = 'SAFE_EXIT' | 'UPSELL' | 'DISCOVERY' | 'RETENTION' | 'ENGAGEMENT';
export type TouristPattern = 'EXPLORING' | 'EXITING' | 'IDLE' | 'RETURNING' | 'LINGERING';

export interface ScoreBreakdown {
  total: number;
  factors: Record<string, number>;
  confidence: number;
}

export interface IsabellaDecision {
  traceId: string;
  territory: string;
  level: DecisionLevel;
  retentionIntent: RetentionIntent;
  score: ScoreBreakdown;
  pattern: TouristPattern;
  distanceToExit: number;
  speedMps: number;
  coords: Coordenadas;
  timestamp: Date;
  payload: {
    titulo: string;
    mensaje: string;
    ruta_ar_activada: boolean;
    experiencia_sugerida?: string;
    federacion_destino?: string;
  };
}

// Alias de compatibilidad
export type Decision = IsabellaDecision;

// ============================================================================
// PUNTOS DE INTERES (POI)
// ============================================================================

export type POICategory = 
  | 'historia' 
  | 'cultura' 
  | 'gastronomia' 
  | 'aventura' 
  | 'hospedaje' 
  | 'comercio' 
  | 'servicios';

export interface PointOfInterest {
  id: string;
  name: string;
  category: POICategory;
  coords: Coordenadas;
  rating: number;
  description: string;
  federacion?: string;
  precioEstimado?: {
    min: number;
    max: number;
    moneda: 'MXN' | 'USD';
  };
  horario?: {
    apertura: string;
    cierre: string;
    diasOperacion: number[];
  };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// ZONAS DE SALIDA (EXIT POINTS)
// ============================================================================

export interface ExitPoint {
  id: string;
  name: string;
  coords: Coordenadas;
  type: 'main' | 'secondary' | 'emergency';
  boundingBox: BoundingBox;
  capacity?: number;
}

// ============================================================================
// SISTEMA HEPTAFEDERADO
// ============================================================================

export type FederationId =
  | 'DEKATEOTL'
  | 'ANUBIS'
  | 'BOOKPI_DATAGIT'
  | 'PHOENIX'
  | 'MDD_TAMV'
  | 'KAOS_HYPERRENDER'
  | 'CHRONOS';

export type FederationStatus = 'ACTIVE' | 'IDLE' | 'DEGRADED' | 'OFFLINE';

export interface FederationModule {
  id: FederationId;
  name: string;
  specialty: string;
  stack: string[];
  role: string;
  status: FederationStatus;
  health: number;
  operationalScore: number;
  lastHeartbeat?: Date;
}

// ============================================================================
// METRICAS Y TELEMETRIA
// ============================================================================

export interface SystemMetrics {
  activeUsers: number;
  placesIndexed: number;
  kernelLatency: number;
  uptime: number;
  intentsProcessed: number;
  decisionsEmitted: number;
  sseConnections: number;
  geoLruSize: number;
  eventsDropped: number;
}

export interface TelemetryEntry {
  id: string;
  label: string;
  status: number;
  specialty: string;
  statusLabel: FederationStatus;
  timestamp: Date;
}

// ============================================================================
// EVENTOS DEL BUS
// ============================================================================

export interface BusEvent<T = unknown> {
  id: string;
  channel: string;
  payload: T;
  timestamp: Date;
  traceId?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

// ============================================================================
// REGLAS DE SCORING
// ============================================================================

export interface ScoreRule {
  id: string;
  name: string;
  weight: number;
  evaluate: (state: TuristaEstado, context: ScoringContext) => number;
}

export interface ScoringContext {
  distanceToNearestExit: number;
  speedMps: number;
  inactivityMinutes: number;
  visitDurationHours: number;
  nearbyPOIs: PointOfInterest[];
  currentZoneSaturation: number;
}

export interface ThresholdConfig {
  critical: number;
  alert: number;
  info: number;
}

// ============================================================================
// CACHE GEOESPACIAL
// ============================================================================

export interface GeoCacheEntry {
  key: string;
  distance: number;
  calculatedAt: Date;
  expiresAt: Date;
}

export interface LRUCacheConfig {
  maxSize: number;
  ttlMs: number;
}

// ============================================================================
// CONTEXTO CIVILIZATORIO (Chronus Engine)
// ============================================================================

export interface ContextoCivilizatorio {
  clima: 'despejado' | 'lluvia' | 'niebla_densa' | 'nublado';
  eventos_activos: string[];
  turistas_concurrentes: number;
  saturacion_zonas: Record<string, number>;
  alertas_activas: string[];
}

// ============================================================================
// CONFIGURACION DEL ORQUESTADOR
// ============================================================================

export interface OrchestratorConfig {
  throttleWindowMs: number;
  minScoreThreshold: number;
  maxQueueSize: number;
  heartbeatIntervalMs: number;
  enableSSE: boolean;
  enableMetrics: boolean;
}

// ============================================================================
// KERNEL OUTPUT
// ============================================================================

export type Intent = 'gastronomia' | 'hospedaje' | 'historia' | 'aventura' | 'cultura' | 'comercio';

export interface KernelOutput {
  intent: Intent;
  recommendations: PointOfInterest[];
  narrative: string;
  confidence: number;
  destinationBrief: string[];
  sources: readonly string[];
  decision?: IsabellaDecision;
}

// ============================================================================
// IDENTIDAD SOBERANA (SSI)
// ============================================================================

export type IdentityStatus = 'PENDING' | 'ACTIVE' | 'REVOKED' | 'RECOVERING' | 'FROZEN';
export type SovereigntyLevel = 'INDIVIDUAL' | 'COMMUNITY' | 'INSTITUTIONAL' | 'FEDERAL';

export interface SovereignIdentity {
  id: string;
  did: string;
  publicKey: string;
  recoveryKeys: string[];
  sovereigntyLevel: SovereigntyLevel;
  status: IdentityStatus;
  nodeId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NODOS CIVILES (Federacion)
// ============================================================================

export type NodeStatus = 'PROVISIONING' | 'ACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED' | 'QUARANTINED';
export type CertificationLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';

export interface CivilNode {
  id: string;
  name: string;
  region: string;
  trustScore: number;
  certificationLevel: CertificationLevel;
  status: NodeStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CONTRATOS SOCIO-TECNICOS
// ============================================================================

export type ContractType = 
  | 'MEMBERSHIP' 
  | 'SERVICE_AGREEMENT' 
  | 'DATA_SHARING' 
  | 'RESOURCE_POOLING' 
  | 'GOVERNANCE' 
  | 'ECONOMIC' 
  | 'SECURITY';

export type ContractStatus = 
  | 'DRAFT' 
  | 'NEGOTIATING' 
  | 'PENDING' 
  | 'ACTIVE' 
  | 'EXPIRED' 
  | 'TERMINATED' 
  | 'DISPUTED';

export interface SocioTechnicalContract {
  id: string;
  type: ContractType;
  title: string;
  description?: string;
  terms: Record<string, unknown>;
  status: ContractStatus;
  partyAId: string;
  partyBId: string;
  validFrom?: Date;
  validUntil?: Date;
  signatures: Array<{
    identityId: string;
    signedAt: Date;
    signature: string;
  }>;
}
