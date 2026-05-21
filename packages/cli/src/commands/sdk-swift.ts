import { generate } from "@ir-kit/openapi-swift";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";

interface Input {
  input: string;
  output: string;
  clean?: boolean;
  normalize?: boolean;
  swiftPackage?: boolean;
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
      description: "Wipe output before writing",
      default: true,
    },
    normalize: {
      type: "boolean",
      description: "Apply spec normalization",
      default: false,
    },
    swiftPackage: {
      type: "boolean",
      description: "Emit Package.swift at output root",
      default: false,
    },
    defaultTag: {
      type: "string",
      description: "Tag for untagged ops (default: 'Default')",
    },
  },
  required: ["input", "output"],
};

export const sdkSwiftCommand: CommandSpec<Input, void> = {
  path: ["sdk", "swift"],
  description: "Generate a Swift SDK from an OpenAPI / TypeSpec spec",
  args,
  handler: async (input) => {
    const doc = await loadOpenAPIForSdk(input.input);
    await generate({
      input: doc,
      output: input.output,
      clean: input.clean,
      normalize: input.normalize,
      defaultTag: input.defaultTag,
      package: input.swiftPackage,
    });
  },
};
