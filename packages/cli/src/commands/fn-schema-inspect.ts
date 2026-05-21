import path from "node:path";

import { runInspect } from "@ir-kit/fn-schema-core";
import { typescript } from "@ir-kit/fn-schema-typescript";
import type { Schema } from "@ir-kit/schema";
import consola from "consola";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  name: string;
  patterns?: string;
  cwd?: string;
  tsconfig?: string;
  params?: string;
  unwrapPromise?: boolean;
  identity?: string;
  transport?: string;
  json?: boolean;
  quiet?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "Function name to inspect" },
    patterns: {
      type: "string",
      description: "Glob pattern(s) for source files",
    },
    cwd: { type: "string", description: "Working directory" },
    tsconfig: { type: "string", description: "Path to tsconfig.json" },
    params: {
      type: "string",
      description: "Parameter rendering",
      enum: ["array", "first-only", "object"],
    },
    unwrapPromise: {
      type: "boolean",
      description: "Unwrap Promise<T> in return types",
    },
    identity: {
      type: "string",
      description: "Vendor keyword for originating TS type",
    },
    transport: {
      type: "string",
      description: "Vendor keyword for binary transport hints",
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON",
      default: false,
    },
    quiet: {
      type: "boolean",
      description: "Suppress non-error logs",
      default: false,
    },
  },
  required: ["name"],
};

export const fnSchemaInspectCommand: CommandSpec<Input, void> = {
  path: ["fn-schema", "inspect"],
  description:
    "Print the resolved input + output JSON Schema for a single function",
  args,
  handler: async (input) => {
    if (input.quiet) consola.level = 1;
    const out = await runInspect({
      name: input.name,
      cwd: input.cwd,
      patterns: input.patterns,
      tsconfig: input.tsconfig,
      params: input.params as "array" | "first-only" | "object" | undefined,
      unwrapPromise: input.unwrapPromise,
      identity: input.identity,
      transport: input.transport,
      extractors: [typescript()],
    });

    if (out.kind === "not-found") {
      consola.error(`Function "${input.name}" not found.`);
      process.exitCode = 1;
      return;
    }
    if (out.kind === "ambiguous") {
      const cwd = path.resolve(input.cwd ?? process.cwd());
      consola.error(
        `Function "${input.name}" matched ${out.matches.length} signatures. Narrow the patterns:`,
      );
      for (const m of out.matches) {
        consola.error(
          `  ${path.relative(cwd, m.file)}:${m.location.line}:${m.location.column}`,
        );
      }
      process.exitCode = 1;
      return;
    }

    if (input.json) {
      process.stdout.write(
        `${JSON.stringify(
          {
            signature: out.signature,
            definitions: out.result.definitions,
            diagnostics: out.result.diagnostics,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }
    renderInspect(
      out.signature,
      out.result,
      path.resolve(input.cwd ?? process.cwd()),
    );
  },
};

function renderInspect(
  sig: {
    id: string;
    file: string;
    location: { line: number; column: number };
    jsDoc?: { description?: string };
    name: string;
    input: unknown;
    output: unknown;
  },
  result: {
    definitions: Record<string, unknown>;
    diagnostics: ReadonlyArray<{
      severity: string;
      code: string;
      message: string;
      function?: string;
    }>;
  },
  cwd: string,
): void {
  const rel = path.relative(cwd, sig.file);
  process.stdout.write(
    `\n${sig.id}  ${rel}:${sig.location.line}:${sig.location.column}\n`,
  );
  if (sig.jsDoc?.description) {
    process.stdout.write(`  ${sig.jsDoc.description}\n`);
  }
  process.stdout.write("\n  input:\n");
  process.stdout.write(indent(JSON.stringify(sig.input, null, 2), 4));
  process.stdout.write("\n\n  output:\n");
  process.stdout.write(indent(JSON.stringify(sig.output, null, 2), 4));
  if (Object.keys(result.definitions).length > 0) {
    process.stdout.write("\n\n  definitions:\n");
    process.stdout.write(
      indent(JSON.stringify(result.definitions, null, 2), 4),
    );
  }
  const fnDiags = result.diagnostics.filter((d) => d.function === sig.name);
  if (fnDiags.length > 0) {
    process.stdout.write("\n\n  diagnostics:\n");
    for (const d of fnDiags) {
      process.stdout.write(`    ${d.severity}  ${d.code}  ${d.message}\n`);
    }
  }
  process.stdout.write("\n");
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => `${pad}${line}`)
    .join("\n");
}
