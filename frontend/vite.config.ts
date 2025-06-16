import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
  },
  build: {
    outDir: "dist",
  },
  json: { namedExports: true, stringify: false },
  resolve: {
    alias: {
      baseUrl: ".",
      src: "/src",
      test: "/test",
      "@": "/src",
      "@lib": "/src/lib",
      "@frontend/*": "./src/*",
      "@frontend/lib": "/src/lib",
      "@frontend/game": "/src/features/gameplay",
      "@frontend/game-access": "/src/features/game-access",
      "@frontend/features/lobby": "/src/features/lobby",
      "@frontend/shared-types": "/src/shared-types",
      "@frontend/style": "/src/style",
      "@game": "/src/features/gameplay",
      "@game-access": "/src/features/game-access",
      "@style": "/src/style",
      "@test": "/test",
    },
  },
});
