import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@backend": "/src",
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    reporters: ["dot"],
  },
});
