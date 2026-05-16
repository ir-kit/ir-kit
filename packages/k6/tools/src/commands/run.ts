import { dirname, resolve } from "node:path";

import {
  buildK6Args,
  bundle,
  type RunTarget,
  resolveTargets,
  spawnK6,
} from "@ahmedrowaihi/k6-toolkit";
import { defineCommand } from "citty";
import { consola } from "consola";

import { type K6ToolsConfig, loadK6ToolsConfig } from "../config.js";

export const runCommand = defineCommand({
  meta: {
    name: "run",
    description:
      "Bundle the loadtest entry with tsdown and execute it with the k6 binary. Supports glob patterns and named loadtests for multi-target projects.",
  },
  args: {
    entry: {
      type: "positional",
      required: false,
      description: "Loadtest entry. Defaults to config.",
    },
    outfile: {
      type: "string",
      description:
        "Bundle output path. Single-target only — multi-target bundles get distinct paths derived from the entry filename.",
      default: "./dist/loadtest.js",
    },
    pattern: {
      type: "string",
      description:
        "Glob pattern to select multiple loadtests (e.g. 'loadtests/*.ts'). Runs the matches in sequence.",
    },
    name: {
      type: "string",
      description:
        "Pick a single named loadtest from `config.loadtests`. Repeatable for a subset.",
    },
    "base-url": {
      type: "string",
      description: "BASE_URL env passed to k6 (overrides spec server).",
    },
    vus: {
      type: "string",
      description: "Override VUs (drives the implicit `default` scenario).",
    },
    duration: {
      type: "string",
      description:
        "Override duration (drives the implicit `default` scenario).",
    },
    out: {
      type: "string",
      description:
        "k6 `--out` shorthand. Pass once (e.g. `json=results.json`) or as a comma-separated list for multiple outputs.",
    },
    summary: {
      type: "string",
      description:
        "k6 `--summary-export` shorthand. Writes the end-of-test summary JSON to this path.",
    },
    "continue-on-error": {
      type: "boolean",
      description:
        "Multi-target only: keep running remaining loadtests if one fails. Default fails fast.",
      default: false,
    },
    "k6-arg": {
      type: "string",
      description:
        "Extra arg appended verbatim to the k6 invocation. Repeatable.",
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const config = await loadK6ToolsConfig(cwd);

    const outfileAbs = resolve(cwd, args.outfile);
    const targets = await resolveTargets({
      cwd,
      entry: args.entry,
      pattern: args.pattern,
      name: args.name,
      loadtests: config.loadtests,
      loadtest: config.loadtest,
      outDir: dirname(outfileAbs),
    }).catch((err: Error) => {
      consola.error(err.message);
      process.exit(1);
    });

    if (!targets.length) {
      consola.error("No loadtest targets matched.");
      process.exit(1);
    }

    const failures = await runAll(targets, args, config.bundle);

    if (failures.length) {
      consola.error(
        `${failures.length}/${targets.length} loadtest(s) failed: ${failures
          .map((f) => f.name)
          .join(", ")}`,
      );
      process.exit(failures[0].code);
    }
    if (targets.length > 1) {
      consola.success(`All ${targets.length} loadtests passed.`);
    }
  },
});

interface Failure {
  name: string;
  code: number;
}

async function runAll(
  targets: ReadonlyArray<RunTarget>,
  args: Record<string, unknown>,
  bundleConfig: K6ToolsConfig["bundle"],
): Promise<Failure[]> {
  const continueOnError = args["continue-on-error"] === true;
  const failures: Failure[] = [];

  for (const target of targets) {
    consola.start(
      `[${target.name}] bundling ${target.entry} → ${target.outfile}`,
    );

    try {
      await bundle({
        ...bundleConfig,
        entry: target.entry,
        outDir: dirname(target.outfile),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      consola.error(`[${target.name}] bundling failed: ${msg}`);
      failures.push({ name: target.name, code: 1 });
      if (!continueOnError) process.exit(1);
      continue;
    }
    consola.success(`[${target.name}] bundle complete.`);

    const k6Args = buildK6Args(target.outfile, {
      baseUrl: args["base-url"] as string | undefined,
      vus: args.vus as string | undefined,
      duration: args.duration as string | undefined,
      out: splitCsv(args.out as string | undefined),
      summary: args.summary as string | undefined,
      extraArgs: passthroughArgs(args["k6-arg"]),
    });
    consola.start(`[${target.name}] running: k6 ${k6Args.join(" ")}`);
    const code = await spawnK6(k6Args);
    if (code === 0) continue;

    failures.push({ name: target.name, code });
    if (!continueOnError) {
      consola.error(
        `[${target.name}] k6 exited with code ${code}. Stopping (pass --continue-on-error to keep going).`,
      );
      process.exit(code);
    }
    consola.warn(`[${target.name}] k6 exited with code ${code}.`);
  }
  return failures;
}

function splitCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function passthroughArgs(value: unknown): string[] {
  if (!value) return [];
  return Array.isArray(value) ? (value as string[]) : [value as string];
}
