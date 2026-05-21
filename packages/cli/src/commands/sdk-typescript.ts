import { generate } from "@ir-kit/openapi-typescript";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";

interface Input {
  input: string;
  output: string;
  normalize?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    input: { type: "string", description: "OpenAPI spec path or URL" },
    output: { type: "string", description: "Output directory" },
    normalize: {
      type: "boolean",
      description: "Apply spec normalization",
      default: false,
    },
  },
  required: ["input", "output"],
};

export const sdkTypescriptCommand: CommandSpec<Input, void> = {
  path: ["sdk", "typescript"],
  description: "Generate a TypeScript SDK (delegates to @hey-api/openapi-ts)",
  args,
  handler: async (input) => {
    const doc = await loadOpenAPIForSdk(input.input);
    await generate({
      input: doc,
      output: input.output,
      normalize: input.normalize,
    });
  },
};
