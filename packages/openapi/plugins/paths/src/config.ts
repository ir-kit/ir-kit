import { type Casing, coerce, type NamingRule } from "@hey-api/shared";
import { definePlugin } from "@ir-kit/openapi-ts-plugin-kit";

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

export const defineConfig = definePlugin(defaultConfig);
