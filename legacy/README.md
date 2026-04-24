# Legacy / Archivo

Este directorio contiene artefactos del proyecto que **ya no se usan en producción** pero se conservan como referencia histórica.

## ¿Por qué están aquí?

El proyecto se consolidó en **Vercel (frontend) + Supabase (backend, auth, DB, edge functions)**. Los siguientes artefactos fueron diseñados para una arquitectura previa basada en contenedores que no llegó a desplegarse en ninguna plataforma (Vercel, Netlify ni Lovable sirven solo frontend estático, y el pipeline de CI/CD que construía imágenes Docker nunca tuvo un destino real).

## Contenido

| Ruta | Qué era | Sustituido por |
|------|---------|----------------|
| `server/` | API Express + Prisma con ~17 rutas (auth, businesses, events, ai, payments, newsletter, etc.) | Supabase (auth, DB con RLS) + Supabase Edge Functions (`supabase/functions/*`) |
| `k8s/` | Manifiestos de Kubernetes | No aplica — Supabase es gestionado |
| `cmd/` | Código Go (`go.mod`, `go.sum`) | No aplica |
| `Dockerfile.backend` | Imagen Docker para el server Express | No aplica |
| `Dockerfile.frontend` | Imagen Docker para servir la SPA con nginx | Vercel CDN |
| `docker-compose*.yml` | Orquestación local de frontend+backend+db | Vercel Preview Deployments + Supabase local (`supabase start`) |
| `nginx.conf` | Configuración nginx para servir la SPA | `vercel.json` con rewrites |

## ¿Puedo borrarlos?

Sí, en cualquier momento. Se dejan aquí unos sprints para:

1. Rescatar lógica de negocio que aún no se haya migrado a Edge Functions
2. Referencia de las rutas/contratos originales si hay clientes que los consumían

Cuando confirmes que toda la lógica crítica vive ya en `supabase/functions/`, borra este directorio completo con `rm -rf legacy/`.

## Lo que NO debe volver aquí

- Ninguna dependencia en `package.json` del root debe referenciar archivos dentro de `legacy/`.
- Ningún import desde `src/` debe apuntar a `legacy/`.
- El CI de Vercel **ignora** este directorio (ver `.vercelignore`).
