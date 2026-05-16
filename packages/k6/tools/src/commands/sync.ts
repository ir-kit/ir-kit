import { resolve } from "node:path";

import { sync } from "@ahmedrowaihi/k6-toolkit";
import { defineCommand } from "citty";
import { consola } from "consola";

import { loadK6ToolsConfig } from "../config.js";

export const syncCommand = defineCommand({
  meta: {
    name: "sync",
    description:
      "Regenerate the typed client + types + data builders from the OpenAPI spec.",
  },
  args: {
    spec: {
      type: "string",
      description: "Path to OpenAPI spec (overrides config).",
    },
    output: {
      type: "string",
      description: "Output directory (overrides config).",
    },
    "scaffold-all": {
      type: "boolean",
      description:
        "Emit one `loadtests/<op>.ts` stub per operation. Existing stubs are kept.",
      default: false,
    },
    "report-renames": {
      type: "boolean",
      description:
        "Diff operationIds against the previous sync's snapshot and warn on renames/removals.",
      default: false,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const config = await loadK6ToolsConfig(cwd);

    const spec = args.spec ?? config.spec;
    if (!spec) {
      consola.error(
        "No `spec` provided. Pass --spec or set it in k6-tools.config.{ts,js}.",
      );
      process.exit(1);
    }
    const output = resolve(cwd, args.output ?? config.output ?? "./src/gen");
    const scaffold =
      args["scaffold-all"] === true || config.scaffoldAll === true;
    const reportRenames = args["report-renames"] === true;

    consola.start(`Generating typed client from ${spec} → ${output}`);
    const result = await sync({
      input: resolve(cwd, spec),
      output,
      normalize: config.normalize ?? true,
      defaultBaseUrl: config.defaultBaseUrl,
      scaffold,
      reportRenames,
    });
    consola.success(`Wrote ${result.files.length} files to ${output}`);
    for (const f of result.files) consola.info(`  ${f.path}`);

    if (reportRenames) logDiff(result.diff);
  },
});

function logDiff(diff: Awaited<ReturnType<typeof sync>>["diff"]): void {
  if (!diff) {
    consola.info(
      "No previous snapshot found — saved one for the next sync to compare against.",
    );
    return;
  }
  if (!diff.renamed.length && !diff.removed.length && !diff.added.length) {
    consola.success("No operation-id drift since last sync.");
    return;
  }
  for (const r of diff.renamed) {
    consola.warn(`renamed: ${r.method} ${r.path} — ${r.from} → ${r.to}`);
  }
  for (const r of diff.removed) {
    consola.warn(`removed: ${r.method} ${r.path} — ${r.operationId}`);
  }
  for (const a of diff.added) {
    consola.info(`added:   ${a.method} ${a.path} — ${a.operationId}`);
  }
}
