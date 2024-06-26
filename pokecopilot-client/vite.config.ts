import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "pokecopilot-client",
        short_name: "pokecopilot",
        description: "AI Copilot-Assisted Web App for Pokémon competitive play",
        theme_color: "#ffffff",
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("@fluentui/react-icons")) {
            return "fluentui-icons";
          } else if (id.includes("@fluentui/react")) {
            return "fluentui-react";
          } else if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    target: "esnext",
  },
  server: {
    proxy: {
      "/content/": "http://localhost:50505",
      "/ask": "http://localhost:50505",
      "/chat": "http://localhost:50505",
      "/config": "http://localhost:50505",
    },
  },
});
