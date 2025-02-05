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
      "@game": "/src/features/gameplay",
      "@game-access": "/src/features/game-access",
      "@codenames/shared/src-types": "/src/shared-types", // Add alias for style
      "@style": "/src/style", // Add alias for style
      "@test": "/test",
    },
  },
});
