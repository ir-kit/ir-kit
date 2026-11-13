import { loadIrConfig } from "../../generate/load-config.js";
import { generate, type TargetResult } from "../../generate/run.js";
import { watch } from "../../generate/watch.js";
import type { Schema } from "../../schema/index.js";
import type { CommandSpec } from "../command-spec.js";
import { log } from "../log.js";

interface Input {
  config?: string;
  targets?: string;
  check?: boolean;
}

const configArgs = {
  config: {
    type: "string",
    description: "Config file (default: ir.config.ts in this directory)",
  },
  targets: {
    type: "string",
    description: "Comma-separated targets to run (default: all in the config)",
  },
} satisfies Record<string, Schema>;

const splitTargets = (value: string | undefined) =>
  value
    ?.split(",")
    .map((name) => name.trim())
    .filter(Boolean);

const report = (results: TargetResult[]) => {
  for (const { target, output } of results) {
    log.success(`${target} → ${output}`);
  }
};

const MAX_LISTED = 20;

export const generateCommand: CommandSpec<Input, void> = {
  path: ["generate"],
  description: "Run every target in ir.config.ts",
  args: {
    type: "object",
    properties: {
      ...configArgs,
      check: {
        type: "boolean",
        description:
          "Don't write. Fail when the output on disk differs from what would be generated",
        default: false,
      },
    },
  },
  handler: async (input) => {
    const { config, cwd } = await loadIrConfig({ configFile: input.config });
    const results = await generate(config, {
      cwd,
      only: splitTargets(input.targets),
      check: input.check,
    });
    if (!input.check) return report(results);

    const stale = results.filter((result) => result.stale.length > 0);
    if (stale.length === 0) {
      log.success(`${results.length} target(s) up to date`);
      return;
    }
    const lines = stale.flatMap(({ target, output, stale: files }) => [
      `${target} (${output}):`,
      ...files.slice(0, MAX_LISTED).map((file) => `  ${file}`),
      ...(files.length > MAX_LISTED
        ? [`  …and ${files.length - MAX_LISTED} more`]
        : []),
    ]);
    throw new Error(
      `Generated output is out of date.\n${lines.join("\n")}\nRun \`ir generate\` and commit the result.`,
    );
  },
};

export const watchCommand: CommandSpec<Omit<Input, "check">, void> = {
  path: ["watch"],
  description: "Run ir.config.ts targets now and again whenever a spec changes",
  args: { type: "object", properties: configArgs },
  handler: async (input) => {
    const controller = new AbortController();
    process.once("SIGINT", () => controller.abort());
    log.info("Watching for changes. Press Ctrl+C to stop.");
    await watch({
      configFile: input.config,
      only: splitTargets(input.targets),
      signal: controller.signal,
      onRun: report,
      onError: (error) =>
        log.error(error instanceof Error ? error.message : String(error)),
    });
  },
};
