import { defineConfig } from "@ahmedrowaihi/k6-tools";

export default defineConfig({
  spec: "../../fixtures/petstore.yaml",
  output: "./src/gen",
  loadtest: "./src/loadtest.ts",
  defaultBaseUrl: "https://petstore3.swagger.io/api/v3",
});
