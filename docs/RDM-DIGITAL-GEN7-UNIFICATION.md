# RDM Digital - Unificacion GEN-7+ Nueva Generacion

## Resumen Ejecutivo

Este documento describe la integracion unificada de los 5 repositorios complementarios en el proyecto principal `real-del-monte-explorer`. El resultado es un sistema de inteligencia territorial de nueva generacion basado en la especificacion TAMV MD-X4.

---

## Repositorios Analizados y Unificados

| Repositorio | Componentes Extraidos | Estado |
|-------------|----------------------|--------|
| **rdm-smart-city-os** | Motor GEN-7+, Scoring Engine, Geo Utils, Metricas Prometheus | INTEGRADO |
| **RDM-Digital-X** | Estructura de paginas, Rutas, Visual Context | REFERENCIADO |
| **real-del-monte-elevated** | Componentes UI avanzados, Tailwind extendido | REFERENCIADO |
| **real-del-monte-twin** | Gemelo Digital, Map3D (ya existente) | EXISTENTE |
| **citemesh-roots** | Prisma Schema NOA-TAMV, Identidad Soberana, Nodos Civiles | INTEGRADO |

---

## Arquitectura GEN-7+ Implementada

```
src/
├── core/                          # NUEVO - Nucleo GEN-7+
│   ├── models.ts                  # 350+ lineas de tipos unificados
│   ├── index.ts                   # Exportaciones centralizadas
│   ├── geo/
│   │   └── index.ts               # BBox, Haversine, LRU Cache, MovementFilter
│   ├── metrics/
│   │   └── prometheus.ts          # Sistema de metricas completo
│   ├── engine/
│   │   └── ScoringEngine.ts       # Motor de scoring con reglas desacopladas
│   └── orchestrator/
│       └── ExperienceOrchestrator.ts  # Orquestador con throttling y EventBus
├── lib/
│   ├── kernel.ts                  # Kernel REALITO unificado con metricas
│   ├── heptafederation.ts         # Sistema heptafederado completo
│   └── isabella.ts                # Fachada de API unificada
└── server/prisma/
    └── schema.prisma              # +250 lineas de modelos GEN-7+
```

---

## Componentes Principales Implementados

### 1. Motor de Decision Territorial (GEN-7+)

**Archivo:** `src/core/orchestrator/ExperienceOrchestrator.ts`

- Evaluacion de turistas en tiempo real
- Cache LRU geoespacial con TTL (10,000 entradas, 5 min TTL)
- Filtro de movimiento EMA (suavizado de velocidad)
- Throttling por turista (1 decision/minuto)
- EventBus con backpressure (max 1000 eventos en cola)
- Reloj inyectable para testing determinista

**Flujo de Decision:**
```
TuristaEstado → FindNearestExit → CalculateSpeed → BuildContext → 
ScoringEngine.evaluate() → DetermineLevel/Intent/Pattern → 
EmitDecision → EventBus → SSE Clients
```

### 2. Motor de Scoring

**Archivo:** `src/core/engine/ScoringEngine.ts`

**Reglas implementadas:**
- `proximityToExitRule` (35%) - Distancia a salida mas cercana
- `movementSpeedRule` (20%) - Velocidad de desplazamiento
- `inactivityRule` (15%) - Tiempo sin interaccion
- `shortVisitRule` (15%) - Duracion de visita corta
- `nearbyPOIsRule` (10%) - POIs cercanos no visitados
- `zoneSaturationRule` (5%) - Saturacion de la zona actual

**Umbrales:**
- CRITICO: score >= 0.7
- ALERTA: score >= 0.5
- INFO: score >= 0.3
- SUGERENCIA: score < 0.3

### 3. Sistema Heptafederado

**Archivo:** `src/lib/heptafederation.ts`

**Modulos:**
| ID | Nombre | Especialidad | Stack |
|----|--------|--------------|-------|
| DEKATEOTL | Dekateotl | Etica y Logica Narrativa | LangGraph, SHAP, RLHF |
| ANUBIS | Anubis Sentinel | Seguridad PQC | Dilithium-5, Kyber-1024, zk-SNARKs |
| BOOKPI_DATAGIT | BookPI / DataGit | Inmutabilidad y Auditoria | IPFS, Merkle Trees |
| PHOENIX | Phoenix Protocol | Resiliencia y P2P | libp2p, Swarm Quorum |
| MDD_TAMV | MDD / TAMV Credits | Economia Creativa | Web3 Identity, Quadratic Funding |
| KAOS_HYPERRENDER | KAOS / HyperRender | Sensorialidad y XR | Three.js, WebNN, Haptics |
| CHRONOS | Chronos Planning | Gestion de Tiempo | Genetic Algorithms, Mapbox GL |

### 4. Sistema de Metricas Prometheus

**Archivo:** `src/core/metrics/prometheus.ts`

**Metricas exportadas:**
- `isabella_territorial_decision_latency_ms` - Histogram de latencia
- `decision_score` - Distribucion de scores
- `decisions_emitted_total` - Counter por territorio/nivel/intent
- `reviews_total` - Feedback por polaridad
- `sse_connections` - Gauge de conexiones activas
- `isabella_geo_lru_size` - Tamano del cache
- `events_dropped_total` - Eventos descartados por backpressure
- `federation_health` - Salud global de la federacion

### 5. Schema Prisma Extendido

**Archivo:** `server/prisma/schema.prisma`

**Nuevos modelos:**
- `IsabellaDecision` - Decisiones territoriales con trazabilidad
- `DecisionFeedback` - Retroalimentacion de usuarios
- `TouristTracking` - Seguimiento de turistas activos
- `FederationTelemetry` - Telemetria de modulos
- `ZoneSaturation` - Saturacion por zonas
- `AutopoiesisLog` - Log de autopoiesis del sistema
- `SovereignIdentity` - Identidades soberanas SSI
- `CivilNode` - Nodos civiles federados

---

## Uso de la API

### Evaluar Turista
```typescript
import { evaluarTurista } from '@/lib/isabella';

const response = await evaluarTurista({
  turistaId: 'TURISTA_12345678',
  coords: { lat: 20.138, lng: -98.671 },
  sessionStartTime: new Date(Date.now() - 3600000),
  lastInteraction: new Date(),
  query: 'donde puedo comer pastes?',
});

// response.decision - Decision de Isabella o null
// response.kernel - Recomendaciones del kernel
// response.federationHealth - Salud de la federacion (0-1)
// response.systemMetrics - Metricas del sistema
// response.telemetry - Telemetria de modulos
```

### Suscribirse a Decisiones (SSE)
```typescript
import { suscribirDecisiones } from '@/lib/isabella';

const unsubscribe = suscribirDecisiones((decision) => {
  console.log('Nueva decision:', decision.traceId);
  console.log('Intent:', decision.retentionIntent);
  console.log('Mensaje:', decision.payload.mensaje);
});

// Limpiar al desmontar
unsubscribe();
```

### Obtener Estado del Sistema
```typescript
import { getSystemStatus } from '@/lib/isabella';

const status = getSystemStatus();
// status.orchestratorStats - Cache, filtros, cola
// status.federationStats - Modulos activos/degradados
// status.systemMetrics - Usuarios, latencia, uptime
// status.placesCount - POIs indexados
```

---

## Brechas Restantes

### Critico
- [ ] Conexion real a proveedor IA (OpenAI/Anthropic) para REALITO
- [ ] Persistencia de decisiones en base de datos (API routes)
- [ ] Endpoints SSE para streaming en tiempo real

### Alto
- [ ] E-commerce Alamexa completo
- [ ] Pagos regionales (OXXO, SPEI)
- [ ] PWA con Service Worker

### Medio
- [ ] Geofencing dinamico con activacion on-site
- [ ] Protocolo TIME UP para sincronizacion
- [ ] Dashboard de telemetria

### Bajo
- [ ] Schema.org JSON-LD
- [ ] Meta tags dinamicos por ruta

---

## Archivos Creados/Modificados

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `src/core/models.ts` | 354 | Tipos unificados GEN-7+ |
| `src/core/index.ts` | 97 | Exportaciones centralizadas |
| `src/core/geo/index.ts` | 290 | Utilidades geoespaciales |
| `src/core/metrics/prometheus.ts` | 366 | Sistema de metricas |
| `src/core/engine/ScoringEngine.ts` | 294 | Motor de scoring |
| `src/core/orchestrator/ExperienceOrchestrator.ts` | 458 | Orquestador principal |
| `src/lib/kernel.ts` | 380 | Kernel REALITO unificado |
| `src/lib/heptafederation.ts` | 356 | Sistema heptafederado |
| `src/lib/isabella.ts` | 232 | Fachada de API |
| `server/prisma/schema.prisma` | +248 | Modelos GEN-7+ |

**Total: ~3,075 lineas de codigo nuevo**

---

## Principios Civilizatorios Aplicados

1. **Dignidad Humana > Rendimiento** - Recovery keys en identidades, consentimiento explicito
2. **Transparencia > Opacidad** - Todo auditable via AutopoiesisLog
3. **Soberania > Dependencia** - Arquitectura federada, datos locales
4. **Autopoiesis Continua** - Sistema que evoluciona y se auto-repara
5. **Resiliencia Civilizatoria** - Nodos federados sin SPOF

---

*Documento generado automaticamente - RDM Digital GEN-7+ v4.1*
*Real del Monte, Hidalgo, Mexico*
