import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import type { TargetName } from "../../generate/config.js";
import { DEFAULT_OUTPUTS, writeConfig } from "../../generate/init.js";
import type { AuthFlavor } from "../../k6-toolkit/index.js";
import type { Schema } from "../../schema/index.js";
import type { CommandSpec } from "../command-spec.js";
import { log } from "../log.js";
import { ask, choose, chooseSome, interactive } from "../prompt.js";

interface Input {
  input?: string;
  targets?: string;
  auth?: AuthFlavor;
  force?: boolean;
}

const OPENAPI_TARGETS: TargetName[] = [
  "typescript",
  "go",
  "kotlin",
  "swift",
  "java",
  "k6",
  "docs",
];
const ASYNCAPI_TARGETS: TargetName[] = ["asyncapi", "docs"];
const AUTH: AuthFlavor[] = ["none", "bearer", "basic", "apiKey", "session"];

const args: Schema = {
  type: "object",
  properties: {
    input: { type: "string", description: "Spec path or URL" },
    targets: {
      type: "string",
      description: `Comma-separated targets. Available: ${[...OPENAPI_TARGETS, "asyncapi"].join(", ")}`,
    },
    auth: {
      type: "string",
      description: "Auth used by the starter loadtest.ts (k6 target only)",
      enum: AUTH,
    },
    force: {
      type: "boolean",
      description: "Replace an existing ir.config.ts",
      default: false,
    },
  },
};

async function looksLikeAsyncAPI(input: string): Promise<boolean> {
  if (/^https?:\/\//i.test(input)) return false;
  const head = await readFile(input, "utf8").catch(() => "");
  return /^\s*\{?\s*["']?asyncapi["']?\s*:/m.test(head);
}

export const initCommand: CommandSpec<Input, void> = {
  path: ["init"],
  description:
    "Write an ir.config.ts, and a starter k6 loadtest when k6 is a target",
  args,
  handler: async (opts) => {
    const cwd = process.cwd();
    const input =
      opts.input ??
      (interactive() ? await ask("Spec path or URL?") : undefined);
    if (!input) throw new Error("Pass the spec with --input.");

    const choices = (await looksLikeAsyncAPI(resolve(cwd, input)))
      ? ASYNCAPI_TARGETS
      : OPENAPI_TARGETS;
    const targets = opts.targets
      ? (opts.targets.split(",").map((t) => t.trim()) as TargetName[])
      : interactive()
        ? await chooseSome("What should ir generate?", choices)
        : undefined;
    if (!targets?.length) throw new Error("Pass the targets with --targets.");
    for (const name of targets) {
      if (!(name in DEFAULT_OUTPUTS)) {
        throw new Error(
          `Unknown target "${name}". Available: ${Object.keys(DEFAULT_OUTPUTS).join(", ")}`,
        );
      }
    }

    const file = await writeConfig({ cwd, input, targets, force: opts.force });
    log.success(`Wrote ${relative(cwd, file)}`);

    if (targets.includes("k6")) {
      const auth =
        opts.auth ??
        (interactive()
          ? await choose("Auth for the starter loadtest?", AUTH)
          : "none");
      const { init } = await import("../../k6-toolkit/index.js");
      const result = await init({
        cwd,
        input,
        output: DEFAULT_OUTPUTS.k6,
        loadtestPath: "loadtest/loadtest.ts",
        auth,
        noOverwrite: true,
      });
      for (const f of result.files) {
        if (f.written) log.success(`Wrote ${relative(cwd, f.path)}`);
      }
    }
    log.info("Next: run `ir generate`.");
  },
};
