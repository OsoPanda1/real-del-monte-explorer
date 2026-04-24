# Evolución de Render Stack (Engine Core + Rendertron + Falcor + Cycles)

## Qué se integró en código
Se añadió una capa de decisión de backend de render para el Gemelo 3D (`Map3DTwin`) con perfiles inspirados en:
- Engine-Labs/engine-core (orquestación runtime modular)
- GoogleChrome/rendertron (prerender SSR para SEO/fallback)
- NVIDIAGameWorks/Falcor (render interactivo high-end)
- blender/cycles (ruta offline/cinemática)

## Implementación
- Nuevo módulo: `src/core/render/renderBackends.ts`
  - `selectRenderBackend(caps)`
  - `estimateGpuTier(deviceMemory)`
  - perfiles `engine-core`, `rendertron`, `falcor`, `cycles`
- `Map3DTwin` ahora detecta capacidades del runtime y muestra el perfil activo en UI.

## Beneficios
1. **Degradación inteligente**: si no hay WebGL o se detecta crawler, usa perfil tipo Rendertron.
2. **Escalado por hardware**: asigna perfil según memoria y soporte de workers.
3. **Trazabilidad visual**: el operador ve en pantalla qué pipeline está activo.

## Siguiente fase recomendada
1. Exponer el perfil seleccionado en telemetría (`prometheus.ts`) para medir cobertura por dispositivo.
2. Añadir render worker dedicado para geometría pesada del gemelo.
3. Implementar prerender server-side en infraestructura edge para rutas críticas de SEO.
