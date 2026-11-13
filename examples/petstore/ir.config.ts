import { defineConfig } from "@ir-kit/kit";

export default defineConfig({
  input: "../../fixtures/petstore.yaml",
  targets: {
    go: { output: "go/sdk", packageName: "petstore", gomod: "petstore" },
    kotlin: { output: "kotlin/sdk", packageName: "com.example.petstore" },
    swift: { output: "swift/sdk", swiftPackage: true },
    java: { output: "java/sdk", packageName: "com.example.petstore" },
    typescript: { output: "typescript/sdk" },
    k6: {
      output: "k6/gen",
      defaultBaseUrl: "https://petstore3.swagger.io/api/v3",
      normalize: true,
    },
    asyncapi: {
      input: "../../fixtures/user-events.yaml",
      output: "events/generated",
    },
  },
});
