import { sync } from "@ir-kit/k6-toolkit";
import type { Schema } from "@ir-kit/schema";
import consola from "consola";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  input: string;
  output: string;
  normalize?: boolean;
  defaultBaseUrl?: string;
  scaffold?: boolean;
  dryRun?: boolean;
  reportRenames?: boolean;
  cwd?: string;
}

const args: Schema = {
  type: "object",
  properties: {
    input: { type: "string", description: "OpenAPI spec path or URL" },
    output: {
      type: "string",
      description: "Output directory for the generated k6 client",
    },
    normalize: {
      type: "boolean",
      description: "Apply spec normalization",
      default: false,
    },
    defaultBaseUrl: {
      type: "string",
      description: "Default base URL (falls back to spec.servers[0].url)",
    },
    scaffold: {
      type: "boolean",
      description: "Also emit per-operation loadtest stubs",
      default: false,
    },
    dryRun: {
      type: "boolean",
      description: "Don't write to disk — just return what would be written",
      default: false,
    },
    reportRenames: {
      type: "boolean",
      description: "Diff operationIds against the prior sync's snapshot",
      default: false,
    },
    cwd: { type: "string", description: "Working directory" },
  },
  required: ["input", "output"],
};

export const k6SyncCommand: CommandSpec<Input, void> = {
  path: ["k6", "sync"],
  description:
    "Generate a typed k6 client + snapshot diff from an OpenAPI spec",
  args,
  handler: async (input) => {
    const result = await sync({
      input: input.input,
      output: input.output,
      cwd: input.cwd,
      normalize: input.normalize,
      defaultBaseUrl: input.defaultBaseUrl,
      scaffold: input.scaffold,
      dryRun: input.dryRun,
      reportRenames: input.reportRenames,
    });
    consola.success(
      `Synced ${result.files.length} file(s) to ${result.output}`,
    );
    if (
      result.diff &&
      (result.diff.added.length || result.diff.removed.length)
    ) {
      consola.box(
        `Renames detected — ${result.diff.added.length} added, ${result.diff.removed.length} removed`,
      );
    }
  },
};
