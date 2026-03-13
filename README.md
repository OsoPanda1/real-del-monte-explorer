# RDM Digital Explorer

Plataforma turística de **Real del Monte** con enfoque narrativo, mapa interactivo, directorio local, eventos y asistente digital.

## Qué incluye hoy

- **Frontend React + Vite + TypeScript** con diseño temático nocturno.
- **Mapa interactivo** con filtros, búsqueda y paginación del directorio de puntos.
- **Pantalla de introducción inmersiva** (consentimiento + video narrativo inicial).
- **Asistente REALITO** para recomendaciones de rutas, gastronomía, historia y eventos.
- **Backend Express + Prisma** para APIs y módulos de contenido exploratorio temático.

## Arquitectura (resumen)

- `src/` → aplicación web (rutas, páginas, componentes UI).
- `server/src/` → API backend (Express, middlewares, rutas).
- `server/prisma/` → esquema y seeds de datos.
- `k8s/` → manifiestos de despliegue (frontend/backend).

## Scripts principales

### Frontend

```bash
npm install
npm run dev
npm run build
npm run lint
```

### Backend

```bash
cd server
npm install
npm run dev
npm run build
npm run db:generate
```

## Variables de entorno clave

### Frontend

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Backend (`server/.env`)

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY` (si se usa pagos)

## Flujo de producto

1. Intro inmersiva con consentimiento de audio/video.
2. Home con narrativa, secciones de contenido y acceso rápido.
3. Mapa con visualización táctica de lugares y negocios.
4. Exploración por tema (`historia`, `cultura`, `gastronomia`, `ecoturismo`) vía `/api/explore/theme/:slug`.
5. Chat contextual para recomendaciones turísticas.

## Estado y mejoras en curso

- Se hicieron correcciones para estabilizar módulos faltantes (`explore route`, `LiveEventBadge`) y conflictos de merge.
- Se añadió base de mejora visual del mapa (search + paginación) e intro narrativa.
- Persisten tareas pendientes globales del backend no relacionadas con este ajuste (tipado/dependencias en módulos legacy).

## Roadmap sugerido (integración mayor)

- Consolidar contratos de API (`zod`/OpenAPI) para frontend-backend.
- Estandarizar diseño visual de páginas y componentes con sistema de tokens.
- Añadir tests de integración para `/api/explore` y flujos críticos de mapa/chat.
- Pipeline de CI con lint + typecheck + build frontend/backend.
- Estrategia de convergencia multi-repo hacia `tamv-digital-nexus` por dominios funcionales.

---

Si quieres, en el siguiente paso te preparo un **plan de integración por fases (90 días)** para unificar repositorios, APIs y despliegue continuo sin romper producción.
