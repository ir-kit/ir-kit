#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

import { compileTypespec } from "./index.js";

const HELP = `
typespec-to-openapi — compile a TypeSpec file to an OpenAPI 3 JSON document.

USAGE
  typespec-to-openapi <main.tsp> [options]

OPTIONS
  --out <file>            Write to file. Default: stdout.
  --version <3.0.0|3.1.0> openapi3 emitter version. Default: emitter default (3.1.0).
  --help, -h              Show this help.

OUTPUT
  JSON on stdout (or --out file). Pipe to \`yq\` for YAML:
    typespec-to-openapi main.tsp | yq -P > openapi.yaml
`.trim();

interface ParsedArgs {
  input: string;
  out?: string;
  version?: string;
  showHelp: boolean;
}

function parseArgs(argv: ReadonlyArray<string>): ParsedArgs {
  let input = "";
  let out: string | undefined;
  let version: string | undefined;
  let showHelp = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      showHelp = true;
      continue;
    }
    if (a === "--out") {
      out = expectValue(argv, ++i, "--out");
      continue;
    }
    if (a === "--version") {
      version = expectValue(argv, ++i, "--version");
      continue;
    }
    if (a?.startsWith("--")) {
      throw new Error(`Unknown option: ${a}`);
    }
    if (a && !input) input = a;
  }

  return { input, out, version, showHelp };
}

function expectValue(
  argv: ReadonlyArray<string>,
  i: number,
  flag: string,
): string {
  const v = argv[i];
  if (!v) throw new Error(`Missing value for ${flag}`);
  return v;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.showHelp || (!args.input && argv.length === 0)) {
    process.stdout.write(`${HELP}\n`);
    return;
  }
  if (!args.input) {
    process.stderr.write("typespec-to-openapi: missing input path.\n");
    process.exit(2);
  }

  const openapi = args.version
    ? { "openapi-versions": [args.version] }
    : undefined;
  const result = await compileTypespec(
    { path: args.input },
    openapi ? { openapi } : undefined,
  );

  const json = JSON.stringify(result.document, null, 2);
  if (args.out) {
    await writeFile(args.out, json);
  } else {
    process.stdout.write(`${json}\n`);
  }
}

main().catch((err) => {
  process.stderr.write(
    `typespec-to-openapi: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
