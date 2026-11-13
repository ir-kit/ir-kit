import { defineConfig } from "vitest/config";

const compilers = ["go", "java", "kotlin", "swift"];

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "ir-kit",
          include: ["tests/**/*.test.ts"],
          // @asyncapi/parser cold-starts slowly on CI runners (spectral rulesets).
          testTimeout: 30_000,
        },
      },
      ...compilers.map((lang) => ({
        test: {
          name: `compiler-${lang}`,
          root: `src/compilers/${lang}`,
          globals: true,
          globalSetup: ["./__tests__/global-teardown.ts"],
        },
      })),
    ],
  },
});
