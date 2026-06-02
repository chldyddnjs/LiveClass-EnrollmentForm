// vitest.config.ts — vite.config.ts와 별도 파일로 분리
import { defineConfig } from "vitest/config";  // ← "vite"가 아닌 "vitest/config"
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});