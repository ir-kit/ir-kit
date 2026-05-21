import { readFile, writeFile } from "node:fs/promises";

import { fromHAR } from "@ir-kit/openapi-recon";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  input: string;
  out?: string;
  title?: string;
  version?: string;
  origin?: string;
  maxExamples?: string;
  pathTemplating?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    input: {
      type: "string",
      description: "HAR file path (or `-` for stdin)",
    },
    out: { type: "string", description: "Write to file (default: stdout)" },
    title: { type: "string", description: "Document title" },
    version: { type: "string", description: "Document version" },
    origin: {
      type: "string",
      description: "Restrict to a single origin (e.g. https://api.example.com)",
    },
    maxExamples: {
      type: "string",
      description: "Max example payloads kept per shape",
      default: "3",
    },
    pathTemplating: {
      type: "boolean",
      description: "Auto-detect path templates from observed URLs",
      default: true,
    },
  },
  required: ["input"],
};

export const reconCommand: CommandSpec<Input, void> = {
  path: ["recon"],
  description:
    "Reverse-engineer an OpenAPI 3.1 spec from a HAR capture of observed HTTP traffic",
  args,
  handler: async (input) => {
    const harText = await readInput(input.input);
    const recon = await fromHAR(harText, {
      title: input.title,
      version: input.version,
      maxExamples:
        input.maxExamples !== undefined ? Number(input.maxExamples) : undefined,
      pathTemplating: input.pathTemplating !== false,
    });
    const spec = recon.toOpenAPI(
      input.origin ? { origin: input.origin } : undefined,
    );
    const json = `${JSON.stringify(spec, null, 2)}\n`;
    if (input.out) {
      await writeFile(input.out, json, "utf8");
    } else {
      process.stdout.write(json);
    }
  },
};

async function readInput(source: string): Promise<string> {
  if (source === "-") {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  return readFile(source, "utf8");
}
