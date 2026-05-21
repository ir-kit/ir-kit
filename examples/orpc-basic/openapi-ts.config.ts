import { defineConfig } from "@hey-api/openapi-ts";
import { defineConfig as defineORPCConfig } from "@ir-kit/openapi-ts-orpc";
import { defineConfig as definePathsConfig } from "@ir-kit/openapi-ts-paths";
import {
  defineConfig as defineTypiaConfig,
  typiaTypeTransformer,
} from "@ir-kit/openapi-ts-typia";

export default defineConfig({
  input: "../../fixtures/petstore.yaml",
  logs: {
    path: "./logs",
  },
  output: {
    path: "./src/generated",
    postProcess: ["oxfmt", "eslint"],
  },
  plugins: [
    {
      name: "@hey-api/typescript",
      "~resolvers": {
        number(ctx) {
          const { $, schema } = ctx;
          // Force int64/uint64 to `number` (instead of `bigint`) so
          // `typia.json.schemas<T>()` can serialise them — JSON Schema
          // has no bigint representation.
          if (schema.format === "int64" || schema.format === "uint64") {
            return $.type("number");
          }
        },
      },
    },
    {
      name: "@hey-api/transformers",
      typeTransformers: [typiaTypeTransformer],
    },
    defineTypiaConfig(),
    definePathsConfig(),
    defineORPCConfig({
      group: "tags",
      comments: true,
      validator: "@ir-kit/openapi-ts-typia",
      server: {
        implementation: true,
        handlers: {
          mode: "stub",
        },
      },
      client: { rpc: true, openapi: true, tanstack: true },
    }),
  ],
});
