import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import { generate } from "@ahmedrowaihi/k6-gen";
import { defineCommand } from "citty";
import { consola } from "consola";

import { renderConfig, renderLoadtest } from "../scaffold/loadtest.tpl.js";

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description:
      "Scaffold a load-test project: loadtest.ts, k6-tools.config.ts, and the generated client.",
  },
  args: {
    spec: { type: "string", description: "Path to OpenAPI spec." },
    output: {
      type: "string",
      description: "Output directory for the generated client.",
      default: "./src/gen",
    },
    auth: {
      type: "string",
      description: "Auth scheme to scaffold: 'bearer' | 'none'.",
      default: "bearer",
    },
    "auth-env": {
      type: "string",
      description: "Env var holding the bearer token.",
      default: "API_TOKEN",
    },
    loadtest: {
      type: "string",
      description: "Path for the user-owned loadtest entry.",
      default: "./loadtest.ts",
    },
    force: {
      type: "boolean",
      description: "Overwrite existing scaffolded files.",
      default: false,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    if (!args.spec) {
      consola.error("Provide --spec <path-to-openapi.yaml>");
      process.exit(1);
    }
    const auth = args.auth === "bearer" ? "bearer" : "none";
    const outputDir = resolve(cwd, args.output);
    const loadtestPath = resolve(cwd, args.loadtest);
    const configPath = resolve(cwd, "k6-tools.config.ts");

    if (!args.force) {
      for (const p of [loadtestPath, configPath]) {
        if (existsSync(p)) {
          consola.error(
            `Refusing to overwrite ${relative(cwd, p)} — pass --force to replace.`,
          );
          process.exit(1);
        }
      }
    }

    consola.start(
      `Generating typed client → ${relative(cwd, outputDir) || outputDir}`,
    );
    const gen = await generate({
      input: resolve(cwd, args.spec),
      output: outputDir,
      normalize: true,
    });
    consola.success(`Wrote ${gen.files.length} files`);

    const clientPath =
      "./" +
      (relative(dirname(loadtestPath), outputDir).replaceAll("\\", "/") ||
        ".") +
      "/index.js";
    const loadtestSource = renderLoadtest({
      clientPath,
      auth,
      authEnv: args["auth-env"],
    });
    await mkdir(dirname(loadtestPath), { recursive: true });
    await writeFile(loadtestPath, loadtestSource);
    consola.success(`Wrote ${relative(cwd, loadtestPath)}`);

    const configSource = renderConfig(args.spec, args.output);
    await writeFile(configPath, configSource);
    consola.success(`Wrote ${relative(cwd, configPath)}`);

    consola.box(
      [
        "Next steps:",
        "  1. pnpm install                          # framework + tools",
        "  2. Edit loadtest.ts                      # define your scenarios",
        "  3. k6-tools run                          # bundle + run against the k6 binary",
        "",
        "Re-run `k6-tools sync` whenever the spec changes.",
      ].join("\n"),
    );
  },
});
