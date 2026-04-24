export type RenderBackendId = 'engine-core' | 'falcor' | 'cycles' | 'rendertron';

export interface RenderRuntimeCaps {
  webgl: boolean;
  workerThreads: boolean;
  ssrPrerender: boolean;
  gpuTier: 'low' | 'medium' | 'high';
}

export interface RenderBackendProfile {
  id: RenderBackendId;
  label: string;
  mode: 'interactive' | 'offline' | 'server';
  strengths: string[];
  recommendedFor: string[];
}

const BACKEND_PROFILES: Record<RenderBackendId, RenderBackendProfile> = {
  'engine-core': {
    id: 'engine-core',
    label: 'Engine Core Runtime',
    mode: 'interactive',
    strengths: ['orquestación de runtime', 'pipeline modular', 'baja latencia'],
    recommendedFor: ['dashboard operativo', 'gemelo urbano en tiempo real'],
  },
  falcor: {
    id: 'falcor',
    label: 'Falcor RTX Track',
    mode: 'interactive',
    strengths: ['path tracing híbrido', 'PBR avanzado', 'debug visual'],
    recommendedFor: ['gemelo 3D premium', 'simulación de iluminación avanzada'],
  },
  cycles: {
    id: 'cycles',
    label: 'Cycles Offline Track',
    mode: 'offline',
    strengths: ['render offline robusto', 'materiales físicamente correctos', 'calidad cinematográfica'],
    recommendedFor: ['assets hero', 'video inmersivo 4D'],
  },
  rendertron: {
    id: 'rendertron',
    label: 'Rendertron Prerender Track',
    mode: 'server',
    strengths: ['prerender SSR', 'SEO técnico', 'fallback sin WebGL'],
    recommendedFor: ['dispositivos legacy', 'crawlers SEO', 'webview restringidos'],
  },
};

export function selectRenderBackend(caps: RenderRuntimeCaps): RenderBackendProfile {
  if (!caps.webgl || caps.ssrPrerender) {
    return BACKEND_PROFILES.rendertron;
  }

  if (caps.gpuTier === 'high' && caps.workerThreads) {
    return BACKEND_PROFILES.falcor;
  }

  if (caps.gpuTier === 'low') {
    return BACKEND_PROFILES['engine-core'];
  }

  return BACKEND_PROFILES.cycles;
}

export function estimateGpuTier(deviceMemory?: number): RenderRuntimeCaps['gpuTier'] {
  if (!deviceMemory || Number.isNaN(deviceMemory)) {
    return 'medium';
  }

  if (deviceMemory <= 2) return 'low';
  if (deviceMemory <= 6) return 'medium';
  return 'high';
}
