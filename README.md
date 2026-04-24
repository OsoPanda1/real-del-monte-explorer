# Real del Monte Explorer (RDM Digital)

Plataforma turística digital para **Real del Monte, Hidalgo**. Combina un frontend inmersivo (React + Vite), módulos de mapa 2D/3D, directorio/comunidad/eventos y un backend API en Express con Prisma para operación de datos, analítica, IA y servicios de negocio.

## ¿Qué hace realmente este proyecto?

### Frontend (este repositorio raíz)
- Experiencia web SPA con rutas públicas de turismo:
  - Inicio, Mapa, Rutas, Historia, Cultura, Relatos, Ecoturismo, Gastronomía, Arte, Comunidad, Directorio, Eventos y más.
- Módulos visuales destacados:
  - **Mapa híbrido 2D/3D** (Leaflet + Three.js).
  - **Galería multimedia** (imagen y video).
  - **Experiencia conversacional REALITO AI** (launcher + componente chat).
- Integración con Supabase para autenticación/datos y funciones edge.

### Backend (`/server`)
API REST con prefijos `/api/v1/*` (y compatibilidad legacy `/api/*`) para:
- auth y usuarios,
- negocios/directorio,
- eventos,
- rutas turísticas,
- posts/comunidad,
- marcadores geoespaciales,
- tips,
- SEO,
- upload,
- pagos,
- newsletter,
- analítica,
- endpoints de IA,
- reporte de brechas de ecosistema GitHub (`/api/v1/ecosystem/*`).

### Infraestructura incluida
- Docker multi-stage para frontend y backend.
- `docker-compose.yml` para levantar frontend + backend + PostgreSQL.
- Manifiestos Kubernetes para frontend y backend (Deployment, Service, Ingress, HPA, ConfigMap, Secret).

---

## Stack técnico

- **Frontend**: React 18, TypeScript, Vite 7, TailwindCSS, Framer Motion, React Router, Leaflet, Three.js, Radix UI.
- **Backend**: Node.js 20, Express, TypeScript, Prisma, PostgreSQL, JWT, Stripe, OpenAI.
- **DevOps**: Docker, Nginx, Kubernetes.

---

## Estructura principal

```text
src/                    # Frontend SPA
server/                 # API backend Express + Prisma
supabase/               # Config y funciones edge
docker-compose.yml      # Stack local containerizado
k8s/                    # Manifiestos de despliegue Kubernetes
Dockerfile.frontend     # Build/serve frontend
Dockerfile.backend      # Build/runtime backend
```

---

## Desarrollo local

### 1) Frontend
```bash
npm install
npm run dev
```
App: `http://localhost:5173`

### 2) Backend (en paralelo)
```bash
npm --prefix server install
npm --prefix server run dev
```
API: `http://localhost:3001`

---

## Variables de entorno recomendadas

### Frontend (`.env` en raíz)
- `VITE_API_URL` (ej. `http://localhost:3001/api/v1`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Backend (`.env` en raíz o `server/.env` según flujo)
- `NODE_ENV=development|production`
- `PORT=3001`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

> Nota: en Kubernetes, estas variables ya están modeladas con `ConfigMap` y `Secret` en `k8s/deployment-backend.yaml`.

---

## Calidad, build y estado actual

### Frontend
```bash
npm run test
npm run build
npm run verify:go-green
```
- `test`: pasa.
- `build`: genera artefactos de producción en `dist/`.
- `verify:go-green`: validación lista para pipeline CI.

### Backend
```bash
npm --prefix server run build
```
- Actualmente existen errores de tipado/compilación que deben resolverse antes de salida a producción completa del backend.
- Este repositorio ya incluye la base de despliegue, pero requiere cierre técnico del backend para CI/CD “verde”.

---

## Producción y despliegue

## Opción A: Docker Compose (rápida para staging)

```bash
docker compose up -d --build
```

Servicios:
- Frontend Nginx: `http://localhost`
- Backend API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

Checklist mínimo:
1. Ajustar credenciales de DB (no usar valores por defecto).
2. Definir `.env` real para backend.
3. Confirmar healthchecks `/health` en frontend y backend.
4. Ejecutar migraciones Prisma en entorno objetivo.

## Opción B: Kubernetes (producción)

Archivos base:
- `k8s/deployment-frontend.yaml`
- `k8s/deployment-backend.yaml`

Flujo recomendado:
1. Publicar imágenes versionadas en registry (`ghcr.io/...`).
2. Reemplazar `:latest` por tags inmutables.
3. Crear namespace y aplicar manifiestos.
4. Cargar secretos reales (`database_url`, `jwt_*`, `stripe_*`, `openai_api_key`).
5. Verificar Ingress TLS y dominio.
6. Validar HPA backend y límites de recursos.

## Pipeline CI para “Go Green”

Se agregó un workflow de GitHub Actions para el frontend:
- Archivo: `.github/workflows/frontend-go-green.yml`
- Etapas: `npm ci` → `npm run test` → `npm run build` → upload de `dist/`
- Objetivo: asegurar que cada PR/commit deje la ruta de despliegue del frontend en estado verde.

---

## Hallazgos del análisis profundo (estado técnico)

1. **Frontend listo para build** y funcional para demo/staging.
2. **Pipeline CI frontend “go green” habilitado** para prevenir regresiones de despliegue.
3. **Backend con deuda técnica de tipado/compilación** (bloquea release full stack estable).
4. **Peso de assets multimedia alto** (videos grandes); recomendable optimización adicional para rendimiento móvil.
5. **Infra de despliegue ya definida** (Docker + K8s), útil para acelerar puesta en marcha con hardening final.

---

## Mejoras realizadas en esta iteración

- Correcciones de visualización/UX en reproductor de video:
  - overlay y controles visibles en móvil,
  - cierre con `Esc`,
  - bloqueo de scroll de fondo al abrir modal,
  - manejo robusto de progreso para evitar estados inválidos.
- Mejora visual en filtros de la página de mapa:
  - botones “Lugares” y “Negocios” ahora reflejan estado activo de forma clara.
- Mejora visual del mapa interactivo 2D:
  - cambio de estilo base oscuro/claro,
  - recenter funcional del viewport,
  - leyenda viva y HUD con coordenadas/zoom en tiempo real.
- Micro presentaciones al inicio de navegación:
  - nuevo banner contextual por ruta para reforzar orientación de usuario.
- Implementación técnica para go green de despliegue frontend:
  - script `verify:go-green` y workflow CI dedicado.
- README completamente actualizado con descripción real, arquitectura, estado actual, producción y despliegue.

---

## Referencias internas clave

- Frontend app y routing: `src/App.tsx`
- Landing: `src/pages/Index.tsx`
- Mapa: `src/pages/Mapa.tsx`, `src/components/map/*`
- Chat IA: `src/components/RealitoChat.tsx`
- Backend bootstrap: `server/src/index.ts`
- Contenedores: `Dockerfile.frontend`, `Dockerfile.backend`, `docker-compose.yml`
- Kubernetes: `k8s/deployment-frontend.yaml`, `k8s/deployment-backend.yaml`
