import { resolve } from "node:path";

import { generate } from "../../sdk/k6/index.js";

import type { K6HeyApiPlugin } from "./types.js";

/**
 * Plugin handler — defers all real work to `ir-kit/sdk/k6`'s
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
