import path from "node:path";

import { runScan } from "@ir-kit/fn-schema-core";
import { typescript } from "@ir-kit/fn-schema-typescript";
import type { Schema } from "@ir-kit/schema";
import consola from "consola";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  patterns?: string;
  cwd?: string;
  tsconfig?: string;
  includeTag?: string;
  excludeName?: string;
  json?: boolean;
  quiet?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    patterns: {
      type: "string",
      description: "Glob pattern(s) for source files",
    },
    cwd: { type: "string", description: "Working directory" },
    tsconfig: { type: "string", description: "Path to tsconfig.json" },
    includeTag: {
      type: "string",
      description: "Only include functions carrying this JSDoc tag",
    },
    excludeName: {
      type: "string",
      description: "Exclude functions whose name matches this regex",
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of a human table",
      default: false,
    },
    quiet: {
      type: "boolean",
      description: "Suppress non-error logs",
      default: false,
    },
  },
};

export const fnSchemaScanCommand: CommandSpec<Input, void> = {
  path: ["fn-schema", "scan"],
  description: "List functions discoverable in source — no schemas generated",
  args,
  handler: async (input) => {
    if (input.quiet) consola.level = 1;
    const out = await runScan({
      cwd: input.cwd,
      patterns: input.patterns,
      tsconfig: input.tsconfig,
      includeTag: input.includeTag,
      excludeName: input.excludeName,
      extractors: [typescript()],
    });
    if (!out.ok) {
      consola.warn("No files matched.");
      return;
    }
    if (input.json) {
      process.stdout.write(`${JSON.stringify(out.result, null, 2)}\n`);
      return;
    }
    renderTable(
      out.result.signatures,
      path.resolve(input.cwd ?? process.cwd()),
    );
    consola.box(
      `${out.result.signatures.length} fn(s) across ${out.filesScanned} file(s) in ${out.durationMs}ms` +
        (out.errors + out.warnings > 0
          ? ` — ${out.errors} error(s), ${out.warnings} warning(s)`
          : ""),
    );
  },
};

interface ScanSig {
  name: string;
  file: string;
  location: { line: number; column: number };
  exported: boolean;
  async: boolean;
  generic: boolean;
  kind: string;
  className?: string;
  jsDoc?: { tags?: Record<string, string | true> };
}

function renderTable(signatures: ReadonlyArray<ScanSig>, cwd: string): void {
  const byFile = new Map<string, ScanSig[]>();
  for (const sig of signatures) {
    const list = byFile.get(sig.file) ?? [];
    list.push(sig);
    byFile.set(sig.file, list);
  }
  for (const [file, list] of byFile) {
    process.stdout.write(`\n${path.relative(cwd, file)}\n`);
    for (const sig of list) {
      const flags = [
        sig.exported ? "exported" : "",
        sig.async ? "async" : "",
        sig.generic ? "generic" : "",
        sig.kind !== "function" ? sig.kind : "",
        sig.className ? `class:${sig.className}` : "",
      ]
        .filter(Boolean)
        .join(" ");
      const tag = sig.jsDoc?.tags
        ? Object.entries(sig.jsDoc.tags)
            .map(([k, v]) => `@${k}${typeof v === "string" ? ` ${v}` : ""}`)
            .join(" ")
        : "";
      process.stdout.write(
        `  ${sig.name.padEnd(24)} ${`${sig.location.line}:${sig.location.column}`.padEnd(8)} ${flags}${tag ? `  ${tag}` : ""}\n`,
      );
    }
  }
}
