# TAMV Digital Nexus — Real del Monte Explorer

Plataforma turística y económica de Real del Monte con arquitectura híbrida:

- **Experiencia web React + Vite** para contenido, rutas, negocios y comunidad.
- **Backend Node/Express** para API, analítica, pagos, IA y operación de negocio.
- **Infraestructura soberana edge-first** para procesamiento espacial y reacción en tiempo real.

## Objetivo del repositorio

Este repo concentra el núcleo funcional del ecosistema TAMV para evolucionar módulos existentes sin degradarlos:

- Orquestación por capas sintéticas (LSM).
- Inteligencia de saturación y autopoiesis local.
- Federación event-driven entre dominios económicos.
- Proxy soberano de baja latencia en nodos edge.

## Estructura principal

```text
.
├── src/                      # Frontend React
│   ├── components/map/       # Render de malla y mapas
│   ├── federaciones/         # Bus federado orientado a eventos
│   ├── kernel/               # Kernel Chronus-Real (Node)
│   └── realito/gen4/         # Orquestador predictivo de experiencia
├── server/                   # Backend API (Express + Prisma)
├── cmd/sovereign-proxy/      # Proxy soberano en Go
├── 001_kernel_civilizatorio_init.sql
├── docker-compose.yml
├── docker-compose.soberano.yml
└── Makefile
```

## Modos de ejecución

### 1) Modo aplicación web/API (stack actual)

```bash
npm ci
npm run dev
```

Backend local (en otra terminal):

```bash
cd server
npm ci
npm run dev
```

### 2) Modo soberano edge-first

Levanta Nginx + PostGIS + Redis + Kernel:

```bash
docker compose -f docker-compose.soberano.yml up --build
```

Variables requeridas:

- `DB_PASS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL` (si ejecutas módulos fuera de Docker)
- `DATABASE_URL` (si ejecutas kernel/proxy fuera de Docker)

## Núcleo espacial y autopoiesis

### Esquema soberano (PostGIS)

```bash
make deploy-schema
```

Este script:

- habilita `postgis` + `pgcrypto`,
- crea el modelo federado (7 federaciones),
- crea índices espaciales,
- activa el trigger de autopoiesis (`pg_notify` sobre `canal_autopoiesis`).

### Kernel Chronus-Real

Implementado en `src/kernel/engine/ChronusEngine.ts`:

- calcula presión zonal por densidad + clima + eventos + concurrencia,
- dispara protocolos de escape cuando presión > 0.85,
- publica señales en `SYSTEM_AUTOPOIESIS_ALERT`.

## Proxy soberano (Go)

Compilación cruzada:

```bash
make build-linux-amd64
make build-linux-arm64
```

Funcionalidad principal:

- enruta rutas críticas espaciales localmente (`/api/v1/kernel/nodos-cercanos`),
- usa `ST_DWithin` directamente contra PostGIS local,
- escucha `LISTEN/NOTIFY` para reacción asíncrona de autopoiesis.

## Bus de federaciones y Realito Gen-4

- `src/federaciones/FederationBus.ts` suscribe eventos de hospedaje y activa flujos cruzados con gastronomía.
- `src/realito/gen4/ExperienceOrchestrator.ts` evalúa geovallas y riesgo de abandono con fórmula Haversine.
- `src/components/map/LSMRenderEngine.tsx` renderiza nodos en tiempo real para capas de movilidad/economía.

## Verificación rápida

```bash
npm run build
go build ./cmd/sovereign-proxy
```

> Nota: `npm run lint` actualmente reporta deuda técnica histórica en múltiples módulos (frontend y server). Se recomienda abordarla por lotes sin bloquear despliegues críticos.

## Roadmap de cierre técnico

1. Endurecer tipado en `server/src/routes/*` y `src/lib/*` para eliminar `any` heredados.
2. Formalizar canal WebSocket backend para `LSM_REALTIME_STREAM` con contratos de evento versionados.
3. Integrar CI dual (web + proxy) con validación de binarios `amd64/arm64`.
4. Consolidar migraciones SQL soberanas en carpeta versionada (`supabase/migrations` o `db/migrations`).
5. Instrumentar observabilidad edge (latencia espacial, presión zonal, eventos por federación).

---

**Estado:** repositorio evolucionado para operación soberana edge-first, manteniendo compatibilidad con el stack web/API actual.
