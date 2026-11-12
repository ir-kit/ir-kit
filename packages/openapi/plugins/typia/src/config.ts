import {
  collectDeps,
  defineConfig as defineConfigTable,
  definePluginConfig,
} from "@hey-api/shared";

import { Api } from "./api";
import { handler } from "./plugin";
import type { TypiaPlugin } from "./types";

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
/**
 * `definePluginConfig` spreads user config over the default table, so a
 * nested user object replaces its table (losing defaults and coercers).
 * Resolve user config against the table here instead.
 */
const pluginFromDefaults = definePluginConfig(defaultConfig);
const normalizeConfig = defineConfigTable<
  Record<string, unknown>,
  Record<string, unknown>
>(defaultConfig.config as never);

export const defineConfig = (
  userConfig?: Parameters<typeof pluginFromDefaults>[0],
) => {
  const plugin = pluginFromDefaults();
  const config = normalizeConfig({ ...userConfig });
  const dependencies = new Set<string>(defaultConfig.dependencies);
  collectDeps(defaultConfig.config as never, config, dependencies);
  return {
    ...plugin,
    config: config as typeof plugin.config,
    dependencies: [...dependencies] as typeof plugin.dependencies,
  };
};
