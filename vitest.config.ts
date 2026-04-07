import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // biome-ignore lint/suspicious/noExplicitAny: vite 7/8 type mismatch between vitest and @vitejs/plugin-react
  plugins: [react({ jsxRuntime: "automatic" }) as any],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
