import { writeFile } from "node:fs/promises";
import type { Schema } from "@ir-kit/schema";
import { convertSpec, listConverters } from "@ir-kit/spec-convert";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  input: string;
  to: string;
  from?: string;
  out?: string;
  format?: string;
}

const targetFormats = Array.from(
  new Set(listConverters().map((p) => p.to)),
).sort();
const sourceFormats = Array.from(
  new Set(listConverters().map((p) => p.from)),
).sort();

const args: Schema = {
  type: "object",
  properties: {
    input: {
      type: "string",
      description: "Spec file path or URL",
    },
    to: {
      type: "string",
      description: "Target format",
      enum: targetFormats,
    },
    from: {
      type: "string",
      description: "Source format (auto-detected if omitted)",
      enum: sourceFormats,
    },
    out: {
      type: "string",
      description: "Write to file (default: stdout)",
    },
    format: {
      type: "string",
      description: "Output format",
      enum: ["json", "yaml"],
      default: "json",
    },
  },
  required: ["input", "to"],
};

export const specConvertCommand: CommandSpec<Input, void> = {
  path: ["spec", "convert"],
  description:
    "Convert between API spec formats (OpenAPI, AsyncAPI, TypeSpec, Protobuf, JSON Schema)",
  args,
  handler: async (input) => {
    const result = await convertSpec({
      input: input.input,
      to: input.to as Parameters<typeof convertSpec>[0]["to"],
      from: input.from as Parameters<typeof convertSpec>[0]["from"] | undefined,
    });

    const serialized = serialize(result.document, input.format ?? "json");
    if (input.out) {
      await writeFile(input.out, serialized);
    } else {
      process.stdout.write(`${serialized}\n`);
    }
  },
};

function serialize(doc: unknown, format: string): string {
  if (format === "yaml") {
    return jsonToYaml(doc);
  }
  return JSON.stringify(doc, null, 2);
}

function jsonToYaml(_: unknown): string {
  throw new Error(
    "YAML output not yet wired — pass through `yq` for now:\n  ir spec convert input.tsp --to openapi3 | yq -P",
  );
}
