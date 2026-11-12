import {
  type Casing,
  coerce,
  collectDeps,
  defineConfig as defineConfigTable,
  definePluginConfig,
  type NamingRule,
} from "@hey-api/shared";

import { handler } from "./plugin.js";
import type { PathsPlugin } from "./types.js";

const CASINGS: ReadonlySet<string> = new Set<Casing>([
  "camelCase",
  "PascalCase",
  "preserve",
  "snake_case",
  "SCREAMING_SNAKE_CASE",
]);

const resolveCasing = (rule: NamingRule | Casing | undefined): Casing => {
  if (typeof rule === "string" && CASINGS.has(rule)) return rule as Casing;
  if (rule && typeof rule === "object") {
    return rule.casing ?? rule.case ?? "camelCase";
  }
  return "camelCase";
};

export const defaultConfig: PathsPlugin["Config"] = {
  config: {
    output: "paths",
    naming: {
      casing: coerce(resolveCasing),
      suffix: "Route",
    },
  },
  dependencies: ["@hey-api/typescript"],
  handler,
  name: "@ir-kit/paths",
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
