import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

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
    out: {
      type: "string",
      description:
        "Output path. File for single-doc/source targets; directory for multi-file targets (json-schema, proto).",
    },
    format: {
      type: "string",
      description:
        "JSON document output format (ignored for source/files targets)",
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

    if (result.output.kind === "files") {
      if (!input.out) {
        throw new Error(
          `Target '${input.to}' produces multiple files; pass --out <directory>.`,
        );
      }
      const dir = resolve(input.out);
      for (const [rel, content] of Object.entries(result.output.files)) {
        const dest = join(dir, rel);
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, content);
      }
      process.stdout.write(
        `Wrote ${Object.keys(result.output.files).length} file(s) to ${dir}\n`,
      );
      return;
    }

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
      "YAML output not yet wired — pipe through `yq` for now:\n  ir spec convert input.tsp --to openapi3 | yq -P",
    );
  }
  return JSON.stringify(doc, null, 2);
}
