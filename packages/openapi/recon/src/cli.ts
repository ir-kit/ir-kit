#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

import { fromHAR } from "./from-har.js";

const HELP = `
openapi-recon — fold a HAR file into an OpenAPI 3.1 spec.

USAGE
  openapi-recon <input.har> [options]
  cat traffic.har | openapi-recon -        # read from stdin

OPTIONS
  --out <file>            Write to file. Default: stdout.
  --title <text>          Document title. Default: "Reverse-engineered API".
  --version <text>        Document version. Default: "0.0.0".
  --origin <url>          Restrict to a single origin (e.g. https://api.example.com).
  --max-examples <n>      Max example payloads kept per shape. Default: 3.
  --no-path-templating    Disable templating (every concrete path stays distinct).
  --help, -h              Show this help.

OUTPUT
  JSON on stdout (or --out file). Pipe to \`yq\` for YAML:
    openapi-recon traffic.har | yq -P > spec.yaml
`.trim();

interface ParsedArgs {
  input: string;
  out?: string;
  title?: string;
  version?: string;
  origin?: string;
  maxExamples?: number;
  pathTemplating: boolean;
  showHelp: boolean;
}

function parseArgs(argv: ReadonlyArray<string>): ParsedArgs {
  let input = "";
  let out: string | undefined;
  let title: string | undefined;
  let version: string | undefined;
  let origin: string | undefined;
  let maxExamples: number | undefined;
  let pathTemplating = true;
  let showHelp = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      showHelp = true;
      continue;
    }
    if (a === "--no-path-templating") {
      pathTemplating = false;
      continue;
    }
    if (a === "--out") {
      out = expectValue(argv, ++i, "--out");
      continue;
    }
    if (a === "--title") {
      title = expectValue(argv, ++i, "--title");
      continue;
    }
    if (a === "--version") {
      version = expectValue(argv, ++i, "--version");
      continue;
    }
    if (a === "--origin") {
      origin = expectValue(argv, ++i, "--origin");
      continue;
    }
    if (a === "--max-examples") {
      const v = expectValue(argv, ++i, "--max-examples");
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0) {
        throw new Error(
          `--max-examples expects a non-negative integer, got "${v}"`,
        );
      }
      maxExamples = n;
      continue;
    }
    if (a.startsWith("-") && a !== "-") {
      throw new Error(`Unknown flag: ${a}`);
    }
    if (input) {
      throw new Error(`Multiple inputs given: "${input}" and "${a}"`);
    }
    input = a;
  }

  if (!input) {
    throw new Error("Missing input — pass a HAR file path or `-` for stdin.");
  }

  return {
    input,
    out,
    title,
    version,
    origin,
    maxExamples,
    pathTemplating,
    showHelp,
  };
}

function expectValue(
  argv: ReadonlyArray<string>,
  idx: number,
  flag: string,
): string {
  const v = argv[idx];
  if (v === undefined || v.startsWith("-")) {
    throw new Error(`${flag} requires a value`);
  }
  return v;
}

async function readInput(source: string): Promise<string> {
  if (source === "-") {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  return readFile(source, "utf8");
}

async function main(): Promise<void> {
  let args: ParsedArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(
      `openapi-recon: ${err instanceof Error ? err.message : String(err)}`,
    );
    console.error("Run `openapi-recon --help` for usage.");
    process.exit(2);
  }

  if (args.showHelp) {
    console.log(HELP);
    process.exit(0);
  }

  const harText = await readInput(args.input);
  const recon = await fromHAR(harText, {
    title: args.title,
    version: args.version,
    maxExamples: args.maxExamples,
    pathTemplating: args.pathTemplating,
  });

  const spec = recon.toOpenAPI(
    args.origin ? { origin: args.origin } : undefined,
  );
  const json = `${JSON.stringify(spec, null, 2)}\n`;

  if (args.out) {
    await writeFile(args.out, json, "utf8");
    const opCount = countOperations(spec.paths);
    console.error(
      `openapi-recon: wrote ${args.out} (${opCount} operation${opCount === 1 ? "" : "s"}, ${recon.sampleCount()} sample${recon.sampleCount() === 1 ? "" : "s"})`,
    );
  } else {
    process.stdout.write(json);
  }
}

function countOperations(paths: unknown): number {
  if (!paths || typeof paths !== "object") return 0;
  let n = 0;
  for (const item of Object.values(paths as Record<string, unknown>)) {
    if (item && typeof item === "object") n += Object.keys(item).length;
  }
  return n;
}

main().catch((err) => {
  console.error(
    "openapi-recon:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
