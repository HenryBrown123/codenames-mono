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
      "@game": "/src/features/gameplay",
      "@pages": "/src/pages", // Add alias for pages
      "@style": "/src/style", // Add alias for style
      "@test": "/test",
    },
  },
});
