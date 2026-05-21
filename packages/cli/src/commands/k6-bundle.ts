import { bundle } from "@ir-kit/k6-toolkit";
import type { Schema } from "@ir-kit/schema";
import consola from "consola";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  input: string;
  output?: string;
  minify?: boolean;
  sourcemap?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    input: { type: "string", description: "Entry .ts file" },
    output: {
      type: "string",
      description: "Output .js path (default: alongside input)",
    },
    minify: {
      type: "boolean",
      description: "Minify the bundle",
      default: false,
    },
    sourcemap: {
      type: "boolean",
      description: "Emit a sourcemap alongside the bundle",
      default: false,
    },
  },
  required: ["input"],
};

export const k6BundleCommand: CommandSpec<Input, void> = {
  path: ["k6", "bundle"],
  description: "Bundle a TypeScript k6 loadtest to a single .js (tsdown)",
  args,
  handler: async (input) => {
    const result = await bundle({
      entry: input.input,
      ...(input.output ? { outFile: input.output } : {}),
      minify: input.minify,
      sourcemap: input.sourcemap,
    } as Parameters<typeof bundle>[0]);
    consola.success(`Bundled to ${result.outfile}`);
  },
};
