import { generate } from "@ir-kit/openapi-java";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";

interface Input {
  input: string;
  output: string;
  clean?: boolean;
  normalize?: boolean;
  gradle?: boolean;
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
      description: "Wipe output before writing",
      default: true,
    },
    normalize: {
      type: "boolean",
      description: "Apply spec normalization",
      default: false,
    },
    gradle: {
      type: "boolean",
      description: "Emit build.gradle.kts + settings.gradle.kts at output root",
      default: false,
    },
    packageName: {
      type: "string",
      description: "Java package name (default: 'com.example.api')",
    },
    defaultTag: {
      type: "string",
      description: "Tag for untagged ops (default: 'Default')",
    },
  },
  required: ["input", "output"],
};

export const sdkJavaCommand: CommandSpec<Input, void> = {
  path: ["sdk", "java"],
  description: "Generate a Java SDK from an OpenAPI / TypeSpec spec",
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
      gradle: input.gradle,
    });
  },
};
