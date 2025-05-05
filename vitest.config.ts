import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",   // 默认即可
    coverage: {
      reporter: ["text", "html"],   // 执行 pnpm test -- --coverage
    },
  },
});