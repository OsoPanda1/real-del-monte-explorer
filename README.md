# Real del Monte Explorer (RDM Digital)

Plataforma turística digital para **Real del Monte, Hidalgo**. SPA inmersiva (React + Vite) con módulos de mapa 2D/3D, directorio, comunidad, eventos y experiencia conversacional REALITO AI, sobre infraestructura serverless **Vercel + Supabase**.

---

## Arquitectura actual

```
┌────────────────────────────────────────────────────────────┐
│                       Navegador                            │
└────────────┬───────────────────────────────┬───────────────┘
             │                               │
             ▼                               ▼
   ┌────────────────────┐         ┌──────────────────────┐
   │      Vercel        │         │      Supabase        │
   │  (CDN + SPA + OG)  │         │                      │
   │                    │         │  - Postgres + RLS    │
   │  React + Vite      │◀────────┤  - Auth              │
   │  Leaflet + Three   │         │  - Storage           │
   │  Framer Motion     │         │  - Edge Functions    │
   └────────────────────┘         │    (realito-chat, …) │
                                  └──────────────────────┘
```

**Una sola fuente de verdad, un solo hosting, un solo backend.** El repo ya no contiene Docker/K8s/Express activos (ver `legacy/`).

---

## Stack

- **Frontend**: React 18, TypeScript, Vite 7, TailwindCSS, Framer Motion, React Router, Leaflet, Three.js, Radix UI, shadcn/ui
- **Backend**: Supabase (Postgres con RLS, Auth, Storage, Edge Functions en Deno)
- **Hosting**: Vercel (CDN global, SPA rewrites, preview deployments por PR)
- **IA**: Edge Function `realito-chat` + integración AI SDK en cliente cuando aplique

---

## Estructura

```text
src/                     # Frontend SPA (pages, components, hooks, integrations)
public/                  # Assets estáticos (incluye og-image.jpg)
supabase/
  config.toml            # Proyecto: dwjaomisrpdzssqzhrtx
  migrations/            # Esquema versionado (aplicar con supabase db push)
  functions/realito-chat # Edge Function para el asistente IA
vercel.json              # SPA rewrites + headers de seguridad/caché
legacy/                  # Backend Express + Docker + K8s archivados (ver legacy/README.md)
```

---

## Desarrollo local

```bash
npm install
cp .env.example .env     # Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev              # http://localhost:8080
```

Para trabajar contra Supabase local (opcional):

```bash
npx supabase start
npx supabase functions serve realito-chat
```

---

## Variables de entorno

Solo las que empiezan con `VITE_` se exponen al cliente. Configurar en Vercel Dashboard → Project → Settings → Environment Variables.

| Variable | Uso | Requerida |
|----------|-----|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (segura para cliente) | Sí |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Alias legacy de la anon key (compatibilidad) | Opcional |
| `VITE_MAPBOX_TOKEN` | Si usas tiles de Mapbox en el mapa | Opcional |

> **Nunca** commitear `.env` al repo (`.gitignore` lo bloquea). Las claves `service_role` de Supabase viven solo en Edge Functions, nunca en el cliente.
> Si falta `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, la app se renderiza en modo degradado para evitar pantalla en blanco, pero sin auth ni datos vivos hasta configurar variables en Vercel.

---

## Despliegue

### Producción

Push a `main` → Vercel construye y publica automáticamente.

```bash
git push origin main
```

`vercel.json` se encarga de:
- Rewrites SPA (rutas como `/mapa`, `/rutas`, `/comunidad` no dan 404 al recargar)
- Headers de caché para assets (`assets/*` inmutables, `og-image.jpg` con revalidación)
- Headers de seguridad (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### Preview

Cada PR genera una URL de preview con su propia instancia. Útil para QA antes de merge.

### Despliegue inmediato en Lovable

Si quieres publicar este repo desde Lovable sin pasos extra:

1. **Framework**: Vite
2. **Install command**: `npm ci`
3. **Build command**: `npm run build`
4. **Output directory**: `dist`
5. **Node.js**: `20.x` o superior (el repo declara `>=20.0.0`)

Variables mínimas en Lovable (Project Settings → Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Opcionales:

- `VITE_MAPBOX_TOKEN`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Checklist rápido antes de publicar:

```bash
npm run test
npm run build
```

Con esto la app queda lista para deploy estático inmediato en Lovable usando el directorio `dist`.

### Edge Functions de Supabase

```bash
npx supabase functions deploy realito-chat
```

Las funciones se despliegan independientemente del frontend.

---

## Scripts

```bash
npm run dev              # Servidor de desarrollo (puerto 8080)
npm run build            # Build de producción en dist/
npm run preview          # Previsualizar el build
npm run lint             # ESLint
npm run test             # Vitest
npm run verify:go-green  # Pipeline local: test + build
```

---

## Decisiones de arquitectura

### Por qué solo Vercel (y no Netlify + Lovable en paralelo)

- **Drift eliminado**: una única tubería de despliegue evita que tres proveedores muestren versiones distintas al mismo tiempo.
- **Un solo lockfile** (`package-lock.json`): builds reproducibles entre local, preview y prod.
- **`.vercelignore`** excluye `legacy/`, `docs/`, workflows y scripts del bundle final.
- **Lovable** (y `lovable-tagger`) permanece como herramienta de desarrollo opcional en `devDependencies`; si se desinstala, `vite.config.ts` sigue funcionando sin errores.

### Por qué Supabase en lugar de Express + Prisma + Postgres propio

- Auth, DB y Edge Functions con un solo SDK en el cliente.
- RLS (Row Level Security) nativo, más seguro que middlewares JWT artesanales.
- Sin servidores que mantener, escalar, parchar o monitorear.
- El backend Express original (`legacy/server/`) se conserva como referencia para migrar rutas pendientes a Edge Functions cuando haga falta.

---

## Rutas de la SPA

Públicas: `/`, `/mapa`, `/rutas`, `/historia`, `/cultura`, `/relatos`, `/ecoturismo`, `/gastronomia`, `/arte`, `/comunidad`, `/directorio`, `/eventos`.

Módulos destacados:
- **Mapa híbrido 2D/3D** con Leaflet + Three.js (`src/pages/Mapa.tsx`, `src/components/map/*`)
- **REALITO AI** chat con Supabase Edge Function (`src/components/RealitoChat.tsx`)

---

## Siguientes pasos recomendados

- [ ] Migrar rutas críticas de `legacy/server/src/routes/` a `supabase/functions/*` cuando se confirme que ningún cliente externo las consume
- [ ] Sustituir `VITE_API_URL` en `src/lib/api.ts`, `src/lib/apiClient.ts`, `src/pages/Gastronomia.tsx` y `src/hooks/useWebSocket.ts` por llamadas directas al cliente de Supabase o a Edge Functions
- [ ] Rotar las claves que hayan estado en el `.env` commiteado (Supabase service_role, Stripe, OpenAI si aplica)
- [ ] Configurar dominio custom en Vercel y deshabilitar el deploy de Netlify en el dashboard de Netlify

---

## Referencias

- App y routing: `src/App.tsx`
- Cliente Supabase: `src/integrations/supabase/client.ts`
- Mapa: `src/pages/Mapa.tsx`, `src/components/map/*`
- Chat IA: `src/components/RealitoChat.tsx`, `supabase/functions/realito-chat/*`
- Configuración Vercel: `vercel.json`, `.vercelignore`
- Backend archivado: `legacy/README.md`
