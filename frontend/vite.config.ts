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
      src: "/src",
      test: "/test",
      "@": "/src",
      "@lib": "/src/lib",
      "@frontend/lib": "/src/lib", // Add this
      "@frontend/game": "/src/features/gameplay", // Add this
      "@frontend/game-access": "/src/features/game-access", // Add this
      "@frontend/shared-types": "/src/shared-types", // Add this
      "@frontend/style": "/src/style", // Add this
      "@game": "/src/features/gameplay",
      "@game-access": "/src/features/game-access",
      // "@codenames/shared/src-types": "/src/shared-types",
      "@style": "/src/style",
      "@test": "/test",
    },
  },
});
