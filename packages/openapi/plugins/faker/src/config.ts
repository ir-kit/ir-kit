import {
  coerce,
  collectDeps,
  defineConfig as defineConfigTable,
  definePluginConfig,
} from "@hey-api/shared";

import { DEFAULT_FORMAT_MAPPING } from "./core/hints.js";
import { handler } from "./plugin.js";
import type { FakerPlugin, FieldNameHints, FormatMapping } from "./types.js";

export { DEFAULT_FORMAT_MAPPING };

const normalizeHintKey = (key: string): string =>
  key.toLowerCase().replace(/[_-]/g, "");

const normalizeFieldNameHints = (hints?: FieldNameHints): FieldNameHints => {
  if (!hints) return {};
  const out: FieldNameHints = {};
  for (const [key, value] of Object.entries(hints)) {
    out[normalizeHintKey(key)] = value;
  }
  return out;
};

export const defaultConfig: FakerPlugin["Config"] = {
  config: {
    output: "factories.gen",
    fieldNameHints: coerce(normalizeFieldNameHints),
    formatMapping: coerce((value?: FormatMapping) => ({
      ...DEFAULT_FORMAT_MAPPING,
      ...value,
    })),
    generateBatchCreators: true,
    defaultBatchCount: 10,
    respectConstraints: true,
    includeInEntry: true,
  },
  dependencies: ["@hey-api/typescript"],
  handler,
  imports: (plugin) => ({
    faker: plugin.symbolFactory.register("faker", {
      external: "@faker-js/faker",
    }),
  }),
  name: "@ir-kit/openapi-ts-faker",
  tags: ["transformer"],
};

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
