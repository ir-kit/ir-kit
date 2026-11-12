import { defineConfig } from "vitest/config";

// @asyncapi/parser cold-starts slowly on CI runners (spectral rulesets).
export default defineConfig({
  test: {
    testTimeout: 30_000,
  },
});
