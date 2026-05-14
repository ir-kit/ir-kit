import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { defineCommand } from "citty";
import { consola } from "consola";

import { bundle } from "../bundle.js";
import { loadK6ToolsConfig } from "../config.js";

export const runCommand = defineCommand({
  meta: {
    name: "run",
    description:
      "Bundle the loadtest entry with esbuild and execute it with the k6 binary.",
  },
  args: {
    entry: {
      type: "positional",
      required: false,
      description: "Loadtest entry. Defaults to config.",
    },
    outfile: {
      type: "string",
      description: "Bundle output path.",
      default: "./dist/loadtest.js",
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
    "k6-arg": {
      type: "string",
      description:
        "Extra arg appended verbatim to the k6 invocation. Repeatable.",
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const config = await loadK6ToolsConfig(cwd);
    const entry = resolve(
      cwd,
      args.entry ?? config.loadtest ?? "./loadtest.ts",
    );
    const outfile = resolve(cwd, args.outfile);

    consola.start(`Bundling ${entry} → ${outfile}`);
    await mkdir(dirname(outfile), { recursive: true });
    await bundle({ entry, outfile });
    consola.success("Bundle complete.");

    const k6Args: string[] = ["run"];
    if (args["base-url"]) k6Args.push("-e", `BASE_URL=${args["base-url"]}`);
    if (args.vus) k6Args.push("--vus", args.vus);
    if (args.duration) k6Args.push("--duration", args.duration);
    const extras = Array.isArray(args["k6-arg"])
      ? args["k6-arg"]
      : args["k6-arg"]
        ? [args["k6-arg"]]
        : [];
    k6Args.push(...extras);
    k6Args.push(outfile);

    consola.start(`Running: k6 ${k6Args.join(" ")}`);
    const child = spawn("k6", k6Args, { stdio: "inherit" });
    const code: number = await new Promise((res, rej) => {
      child.on("exit", (c) => res(c ?? 0));
      child.on("error", rej);
    });
    process.exit(code);
  },
});
