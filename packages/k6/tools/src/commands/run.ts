import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import { defineCommand } from "citty";
import { consola } from "consola";

import { bundle } from "../bundle.js";
import { loadK6ToolsConfig } from "../config.js";
import { buildK6Args, runK6 } from "../run/k6-runner.js";
import { type RunTarget, resolveTargets } from "../run/targets.js";

export const runCommand = defineCommand({
  meta: {
    name: "run",
    description:
      "Bundle the loadtest entry with esbuild and execute it with the k6 binary. Supports glob patterns and named loadtests for multi-target projects.",
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
    const targets = await resolveTargets(cwd, args, config);

    if (!targets.length) {
      consola.error("No loadtest targets matched.");
      process.exit(1);
    }

    const failures = await runAll(targets, args);

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
  args: Parameters<typeof buildK6Args>[1] & { "continue-on-error"?: boolean },
): Promise<Failure[]> {
  const continueOnError = args["continue-on-error"] === true;
  const failures: Failure[] = [];

  for (const target of targets) {
    consola.start(
      `[${target.name}] bundling ${target.entry} → ${target.outfile}`,
    );
    await mkdir(dirname(target.outfile), { recursive: true });
    await bundle({ entry: target.entry, outfile: target.outfile });
    consola.success(`[${target.name}] bundle complete.`);

    const code = await runK6(target, buildK6Args(target, args));
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
