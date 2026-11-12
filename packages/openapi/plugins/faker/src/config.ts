import { coerce } from "@hey-api/shared";
import { definePlugin } from "@ir-kit/openapi-ts-plugin-kit";

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

export const defineConfig = definePlugin(defaultConfig);
