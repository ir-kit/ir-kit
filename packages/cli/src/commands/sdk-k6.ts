import { generate } from "@ir-kit/k6-gen";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";

interface Input {
  input: string;
  output: string;
  normalize?: boolean;
  scaffold?: boolean;
  defaultBaseUrl?: string;
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
    scaffold: {
      type: "boolean",
      description: "Also emit per-operation loadtest stubs",
      default: false,
    },
    defaultBaseUrl: {
      type: "string",
      description: "Default base URL (falls back to spec.servers[0].url)",
    },
  },
  required: ["input", "output"],
};

export const sdkK6Command: CommandSpec<Input, void> = {
  path: ["sdk", "k6"],
  description:
    "Generate a typed k6 client + types + faker-backed data builders",
  args,
  handler: async (input) => {
    const doc = await loadOpenAPIForSdk(input.input);
    await generate({
      input: doc,
      output: input.output,
      normalize: input.normalize,
      scaffold: input.scaffold,
      defaultBaseUrl: input.defaultBaseUrl,
    });
  },
};
