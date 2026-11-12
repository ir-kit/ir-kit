import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    globalSetup: ["./src/__tests__/global-teardown.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
