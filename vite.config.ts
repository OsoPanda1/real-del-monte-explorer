import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// lovable-tagger is an optional dev-only dependency.
// If the package is removed from package.json, the build still works.
async function loadLovableTagger(): Promise<PluginOption | null> {
  try {
    const mod = await import("lovable-tagger");
    return mod.componentTagger();
  } catch {
    return null;
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [react()];

  if (mode === "development") {
    const tagger = await loadLovableTagger();
    if (tagger) plugins.push(tagger);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (
              id.includes("/node_modules/react/") ||
              id.includes("/node_modules/react-dom/") ||
              id.includes("/node_modules/react-router-dom/")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("/node_modules/three/") ||
              id.includes("/node_modules/@react-three/fiber/") ||
              id.includes("/node_modules/@react-three/drei/")
            ) {
              return "vendor-three";
            }
            if (id.includes("/node_modules/framer-motion/")) return "vendor-motion";
            if (id.includes("/node_modules/@google/genai/")) return "vendor-genai";
            if (
              id.includes("/node_modules/leaflet/") ||
              id.includes("/node_modules/react-leaflet/") ||
              id.includes("/node_modules/supercluster/")
            ) {
              return "vendor-leaflet";
            }
            return undefined;
          },
        },
      },
    },
  };
});
