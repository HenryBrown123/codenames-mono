import { defineConfig } from "vitest/config";
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
      "@game": "/src/features/gameplay",
      "@pages": "/src/pages", // Alias for pages
      "@style": "/src/style", // Alias for style
      "@test": "/test",
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    alias: {
      src: "/src",
      test: "/test",
      "@": "/src",
      "@frontend/*": "/src/*",
      "@game": "/src/features/gameplay",
      "@game-access": "/src/features/access",
      "@pages": "/src/pages",
      "@style": "/src/style",
      "@codenames/shared/src-types": "/src/shared-types", // Add alias for style
      "@test": "/test",
    },
    reporters: ["dot"],
  },
});
