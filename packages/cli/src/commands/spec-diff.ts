import { writeFile } from "node:fs/promises";

import type { Schema } from "@ir-kit/schema";
import { diffSpecs } from "@ir-kit/spec-diff";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  before: string;
  after: string;
  out?: string;
  failOnBreaking?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    before: {
      type: "string",
      description: "Base spec (file path or URL)",
    },
    after: {
      type: "string",
      description: "Head spec to compare against base (file path or URL)",
    },
    out: {
      type: "string",
      description: "Write full JSON diff report to this path",
    },
    failOnBreaking: {
      type: "boolean",
      description: "Exit non-zero if any breaking changes are detected",
      default: false,
    },
  },
  required: ["before", "after"],
};

export const specDiffCommand: CommandSpec<Input, void> = {
  path: ["spec", "diff"],
  description:
    "Diff two specs (any supported format) — converts both to OpenAPI 3 and classifies breaking vs non-breaking changes",
  args,
  handler: async (input) => {
    const result = await diffSpecs({
      before: input.before,
      after: input.after,
    });

    const { summary, diffs } = result;
    const lines = [
      `${summary.total} change(s): ${summary.breaking} breaking, ${summary.nonBreaking} non-breaking, ${summary.annotation} annotation, ${summary.unclassified} unclassified, ${summary.deprecated} deprecated`,
      `(${result.before.from} → ${result.after.from})`,
      "",
    ];
    for (const diff of diffs) {
      lines.push(
        `  [${diff.type}] ${diff.action} /${diff.path.join("/")}${
          diff.description ? ` — ${diff.description}` : ""
        }`,
      );
    }
    process.stdout.write(`${lines.join("\n")}\n`);

    if (input.out) {
      await writeFile(input.out, JSON.stringify(result, null, 2));
    }

    if (input.failOnBreaking && summary.breaking > 0) {
      process.exit(1);
    }
  },
};
