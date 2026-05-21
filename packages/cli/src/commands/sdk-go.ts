import { generate } from "@ir-kit/openapi-go";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";

interface Input {
  input: string;
  output: string;
  clean?: boolean;
  normalize?: boolean;
  gomod?: string;
  packageName?: string;
  defaultTag?: string;
}

const args: Schema = {
  type: "object",
  properties: {
    input: {
      type: "string",
      description: "OpenAPI spec path, URL, or .tsp file",
    },
    output: { type: "string", description: "Output directory" },
    clean: {
      type: "boolean",
      description: "Wipe output directory before writing",
      default: true,
    },
    normalize: {
      type: "boolean",
      description: "Apply hey-api spec normalization",
      default: false,
    },
    gomod: {
      type: "string",
      description: "Emit go.mod with this module path (e.g. github.com/me/sdk)",
    },
    packageName: {
      type: "string",
      description: "Go package name (default: 'api')",
    },
    defaultTag: {
      type: "string",
      description: "Tag used when an op has none (default: 'Default')",
    },
  },
  required: ["input", "output"],
};

export const sdkGoCommand: CommandSpec<Input, void> = {
  path: ["sdk", "go"],
  description: "Generate a Go SDK from an OpenAPI / TypeSpec spec",
  args,
  handler: async (input) => {
    const doc = await loadOpenAPIForSdk(input.input);
    await generate({
      input: doc,
      output: input.output,
      clean: input.clean,
      normalize: input.normalize,
      packageName: input.packageName,
      defaultTag: input.defaultTag,
      ...(input.gomod ? { gomod: { module: input.gomod } } : {}),
    });
  },
};
