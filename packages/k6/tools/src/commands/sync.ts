import { resolve } from "node:path";

import { generate } from "@ahmedrowaihi/k6-gen";
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
    consola.start(`Generating typed client from ${spec} → ${output}`);
    const result = await generate({
      input: resolve(cwd, spec),
      output,
      normalize: config.normalize ?? true,
      defaultBaseUrl: config.defaultBaseUrl,
    });
    consola.success(`Wrote ${result.files.length} files to ${output}`);
    for (const f of result.files) consola.info(`  ${f.path}`);
  },
});
