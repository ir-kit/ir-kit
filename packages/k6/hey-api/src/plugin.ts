import { resolve } from "node:path";

import { generate } from "@ir-kit/k6-gen";

import type { K6HeyApiPlugin } from "./types.js";

/**
 * Plugin handler — defers all real work to `@ir-kit/k6-gen`'s
 * standalone `generate()`. The hey-api context already $ref-bundled and
 * normalized the spec, so we pass that through and disable our own
 * normalize step.
 */
export const handler: K6HeyApiPlugin["Handler"] = ({ plugin }) => {
  const outputBase = plugin.context.config.output.path;
  const outDir = resolve(outputBase, plugin.config.output);
  const spec = plugin.context.spec as Record<string, unknown>;

  return generate({
    input: spec,
    output: outDir,
    defaultBaseUrl: plugin.config.defaultBaseUrl,
    normalize: false,
  }).then(() => undefined);
};
