import { definePlugin } from "../kit/index.js";

import { Api } from "./api.js";
import { handler } from "./plugin.js";
import type { TypiaPlugin } from "./types.js";

const namingCoercers = {
  boolean: (enabled: boolean) => ({ enabled }),
  function: (name: (name: string) => string) => ({ name }),
  string: (name: string) => ({ name }),
};

export const defaultConfig: TypiaPlugin["Config"] = {
  api: new Api(),
  config: {
    $cascade: ["case"],
    case: "camelCase",
    comments: true,
    includeInEntry: false,
    jsonSchema: true,
    requests: {
      $coerce: namingCoercers,
      enabled: true,
      jsonName: "t{{name}}DataJsonSchema",
      name: "t{{name}}Data",
    },
    responses: {
      $coerce: namingCoercers,
      enabled: true,
      jsonName: "t{{name}}ResponseJsonSchema",
      name: "t{{name}}Response",
    },
  },
  dependencies: ["@hey-api/transformers", "@hey-api/typescript"],
  handler,
  imports: (plugin) => {
    const factory = plugin.symbolFactory;
    return {
      StandardSchemaV1: factory.register("StandardSchemaV1", {
        external: "@standard-schema/spec",
        kind: "type",
      }),
      typia: {
        IValidation: factory.register("IValidation", {
          external: "typia",
          kind: "type",
        }),
        createValidate: factory.register("createValidate", {
          external: "typia",
        }),
        json: factory.register("json", { external: "typia" }),
      },
    };
  },
  name: "@ir-kit/openapi-ts-typia",
  tags: ["validator"],
};

/**
 * Type helper for Typia plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePlugin(defaultConfig);
