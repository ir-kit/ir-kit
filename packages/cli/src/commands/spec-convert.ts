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
    input: { type: "string", description: "Spec file path or URL" },
    to: { type: "string", description: "Target format", enum: targetFormats },
    from: {
      type: "string",
      description: "Source format (auto-detected if omitted)",
      enum: sourceFormats,
    },
    out: { type: "string", description: "Write to file (default: stdout)" },
    format: {
      type: "string",
      description:
        "JSON document output format (ignored for source targets like typespec)",
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

    const text =
      result.output.kind === "source"
        ? result.output.source
        : serialize(result.output.document, input.format ?? "json");

    if (input.out) {
      await writeFile(input.out, text);
    } else {
      process.stdout.write(text.endsWith("\n") ? text : `${text}\n`);
    }
  },
};

function serialize(doc: unknown, format: string): string {
  if (format === "yaml") {
    throw new Error(
      "YAML output not yet wired — pass through `yq` for now:\n  ir spec convert input.tsp --to openapi3 | yq -P",
    );
  }
  return JSON.stringify(doc, null, 2);
}
