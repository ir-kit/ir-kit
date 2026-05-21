import { runDiff } from "@ir-kit/fn-schema-core";
import type { Schema } from "@ir-kit/schema";
import consola from "consola";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  from: string;
  to: string;
  json?: boolean;
  breakingOnly?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    from: { type: "string", description: "Baseline bundle (JSON path)" },
    to: { type: "string", description: "New bundle (JSON path)" },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON",
      default: false,
    },
    breakingOnly: {
      type: "boolean",
      description:
        "Exit non-zero only when changes are breaking (removed signatures, changed input/output shape)",
      default: false,
    },
  },
  required: ["from", "to"],
};

export const fnSchemaDiffCommand: CommandSpec<Input, void> = {
  path: ["fn-schema", "diff"],
  description:
    "Compare two fn-schema bundles. Reports added/removed/changed signatures and definitions",
  args,
  handler: async (input) => {
    const out = await runDiff(input.from, input.to);

    if (input.json) {
      process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    } else {
      for (const c of out.changes) {
        const marker =
          c.kind === "added" ? "+" : c.kind === "removed" ? "-" : "~";
        process.stdout.write(`${marker} ${c.id}  (${c.kind})\n`);
      }
      for (const d of out.definitionChanges) {
        const marker =
          d.kind === "added" ? "+" : d.kind === "removed" ? "-" : "~";
        process.stdout.write(`${marker} def ${d.name}  (${d.kind})\n`);
      }
      consola.box(
        `${out.changes.length} signature change(s), ${out.definitionChanges.length} definition change(s) — ${out.breaking} breaking, ${out.additive} additive`,
      );
    }

    const fail = input.breakingOnly ? out.breaking > 0 : out.changes.length > 0;
    if (fail) process.exitCode = 1;
  },
};
