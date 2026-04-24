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
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-three": ["three", "@react-three/fiber", "@react-three/drei"],
            "vendor-motion": ["framer-motion"],
            "vendor-genai": ["@google/genai"],
            "vendor-leaflet": ["leaflet", "react-leaflet", "supercluster"],
          },
        },
      },
    },
  };
});
