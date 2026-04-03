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
      "@frontend/api": "/src/api/api.ts",
      "@frontend/auth": "/src/auth",
      "@frontend/websocket": "/src/websocket",
      "@frontend/utils": "/src/utils",
      "@frontend/game": "/src/gameplay",
      "@frontend/gameplay": "/src/gameplay",
      "@frontend/game-access": "/src/game-access",
      "@frontend/lobby": "/src/lobby",
      "@frontend/shared-types": "/src/shared-types",
      "@frontend/style": "/src/style",
      "@frontend/ai": "/src/ai",
      "@frontend/chat": "/src/chat",
      "@game": "/src/gameplay",
      "@game-access": "/src/game-access",
      "@style": "/src/style",
      "@test": "/test",
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["test/**", "node_modules/**"],
  },
});
