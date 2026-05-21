import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { intro, log, outro } from "@clack/prompts";
import { loadSpec } from "@ir-kit/openapi-tools";
import { parseSpec } from "@ir-kit/openapi-tools/parse";

import type { AuthScaffoldOpts } from "../loadtest-scaffold.js";
import type { ChainMode } from "./chains.js";
import {
  type PacePreset,
  type ScaffoldScenarioOpts,
  scaffoldScenario,
} from "./scenario.js";
import { readSpecOperations, type SpecOperations } from "./spec-tags.js";
import { confirmOverwrite, runScenarioWizard } from "./wizard.js";

const HELP = `
k6-ts scaffold — generate scenario files from your OpenAPI spec.

USAGE
  k6-ts scaffold                            # interactive wizard
  k6-ts scaffold list-ops [--json]          # discover ops (grouped by tag)
  k6-ts scaffold [flags…]                   # flag-driven, single scenario
  k6-ts scaffold --tags <a,b,c> [flags…]    # batch — one scenario per tag

REQUIRED (flag mode)
  --name <slug>                Scenario name (used for filename + step label)
  --ops <a,b,c>                Comma-separated operation IDs

OPTIONAL
  --spec <path-or-url>         OpenAPI spec. Default: ./openapi.yaml
  --client-import <path>       Import path for the generated client.
                               Default: ./src/gen/index.js
  --chain sequential|batch     Default: sequential
  --pace smoke|load|stress|spike|soak     Default: smoke
  --duration <duration>        Default: 30s (or 1h for soak)
  --auth none|bearer|basic|apiKey|session|digest|ntlm    Default: none
  --output <file>              Where to write (single scenario)
  --output-dir <dir>           Where to write (batch mode)
  --force                      Overwrite without prompting
  --help                       Show this help

BATCH MODE (--tags)
  Generates one scenario file per tag, named after the tag. Each picks all
  operations carrying that tag with sensible defaults (smoke, sequential).
`.trim();

interface FlagMode {
  kind: "flags";
  name?: string;
  ops?: string;
  spec: string;
  clientImport: string;
  chain: ChainMode;
  pace: PacePreset;
  duration?: string;
  auth: string;
  output?: string;
  outputDir?: string;
  tags?: string;
  force: boolean;
  showHelp: boolean;
}

interface ListOpsMode {
  kind: "list-ops";
  spec: string;
  json: boolean;
}

type Parsed = FlagMode | ListOpsMode;

function parseArgs(argv: ReadonlyArray<string>): Parsed {
  if (argv[0] === "list-ops") {
    return {
      kind: "list-ops",
      spec: pickFlag(argv, "--spec") ?? "./openapi.yaml",
      json: argv.includes("--json"),
    };
  }

  return {
    kind: "flags",
    name: pickFlag(argv, "--name"),
    ops: pickFlag(argv, "--ops"),
    tags: pickFlag(argv, "--tags"),
    spec: pickFlag(argv, "--spec") ?? "./openapi.yaml",
    clientImport: pickFlag(argv, "--client-import") ?? "./src/gen/index.js",
    chain: (pickFlag(argv, "--chain") as ChainMode) ?? "sequential",
    pace: (pickFlag(argv, "--pace") as PacePreset) ?? "smoke",
    duration: pickFlag(argv, "--duration"),
    auth: pickFlag(argv, "--auth") ?? "none",
    output: pickFlag(argv, "--output"),
    outputDir: pickFlag(argv, "--output-dir"),
    force: argv.includes("--force"),
    showHelp: argv.includes("--help") || argv.includes("-h"),
  };
}

function pickFlag(
  argv: ReadonlyArray<string>,
  name: string,
): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

export async function runScaffoldCommand(
  argv: ReadonlyArray<string>,
): Promise<void> {
  const parsed = parseArgs(argv);

  if (parsed.kind === "flags" && parsed.showHelp) {
    console.log(HELP);
    return;
  }

  // list-ops subcommand — no I/O beyond stdout
  if (parsed.kind === "list-ops") {
    await listOps(parsed);
    return;
  }

  const spec = await loadAndIndexSpec(parsed.spec);

  // Batch mode: --tags <a,b,c>
  if (parsed.tags) {
    await scaffoldByTags(spec, parsed);
    return;
  }

  // Flag mode (non-interactive): --name + --ops required
  if (parsed.name && parsed.ops) {
    await scaffoldFromFlags(spec, parsed);
    return;
  }

  // Interactive — no name/ops/tags
  await scaffoldInteractive(spec, parsed);
}

async function loadAndIndexSpec(specPath: string): Promise<SpecOperations> {
  const bundled = await loadSpec({ input: specPath, normalize: true });
  const ir = parseSpec(bundled);
  return readSpecOperations(ir.paths);
}

async function listOps(parsed: ListOpsMode): Promise<void> {
  const spec = await loadAndIndexSpec(parsed.spec);

  if (parsed.json) {
    const byTag: Record<string, string[]> = {};
    for (const [tag, ops] of spec.byTag) {
      byTag[tag] = ops.map((o) => o.id);
    }
    console.log(JSON.stringify({ byTag, total: spec.all.length }, null, 2));
    return;
  }

  for (const [tag, ops] of spec.byTag) {
    console.log(`\n${tag}  (${ops.length} ops)`);
    for (const op of ops) {
      console.log(
        `  ${op.method.toUpperCase().padEnd(6)} ${op.path}  ·  ${op.id}`,
      );
    }
  }
  console.log(`\n${spec.all.length} total ops`);
}

async function scaffoldFromFlags(
  spec: SpecOperations,
  parsed: FlagMode,
): Promise<void> {
  const opIds = parsed
    .ops!.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ops = opIds
    .map((id) => spec.byId.get(id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  if (ops.length !== opIds.length) {
    const missing = opIds.filter((id) => !spec.byId.has(id));
    console.error(
      `k6-ts scaffold: unknown operationId(s): ${missing.join(", ")}`,
    );
    process.exit(2);
  }

  const slug = parsed.name!.trim().replace(/[^a-zA-Z0-9-]+/g, "-");
  const output =
    parsed.output ?? `${parsed.outputDir ?? "./loadtests"}/${slug}.ts`;

  const scaffold: ScaffoldScenarioOpts = {
    clientImportPath: parsed.clientImport,
    pace: parsed.pace,
    duration: parsed.duration,
    ops,
    chain: parsed.chain,
    auth: { auth: parsed.auth as AuthScaffoldOpts["auth"] },
  };

  await writeScenario(output, scaffold, parsed.force);
  console.log(`Wrote ${relative(process.cwd(), output)}`);
}

async function scaffoldByTags(
  spec: SpecOperations,
  parsed: FlagMode,
): Promise<void> {
  const tags = parsed
    .tags!.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const outputDir = parsed.outputDir ?? "./loadtests";
  const force = parsed.force;

  for (const tag of tags) {
    const ops = spec.byTag.get(tag);
    if (!ops || ops.length === 0) {
      console.error(`k6-ts scaffold: no operations under tag "${tag}"`);
      continue;
    }
    const slug = tag.replace(/[^a-zA-Z0-9-]+/g, "-");
    const output = `${outputDir}/${slug}.ts`;
    await writeScenario(
      output,
      {
        clientImportPath: parsed.clientImport,
        pace: parsed.pace,
        duration: parsed.duration,
        ops,
        chain: parsed.chain,
        auth: { auth: parsed.auth as AuthScaffoldOpts["auth"] },
      },
      force,
    );
    console.log(
      `Wrote ${relative(process.cwd(), output)}  (${ops.length} ops)`,
    );
  }
}

async function scaffoldInteractive(
  spec: SpecOperations,
  parsed: FlagMode,
): Promise<void> {
  intro("k6-ts scaffold");
  const result = await runScenarioWizard(spec, {
    clientImportPath: parsed.clientImport,
    outputDir: parsed.outputDir ?? "./loadtests",
  });
  if (!result) return;

  await writeScenario(result.outputPath, result.scaffold, parsed.force);

  outro(
    [
      `Wrote ${relative(process.cwd(), result.outputPath)}`,
      `Run it: k6-ts run ${relative(process.cwd(), result.outputPath)}`,
    ].join("\n"),
  );
}

async function writeScenario(
  output: string,
  scaffold: ScaffoldScenarioOpts,
  force: boolean,
): Promise<void> {
  const absolute = resolve(output);

  if (existsSync(absolute) && !force) {
    const ok = await confirmOverwrite(relative(process.cwd(), absolute));
    if (!ok) {
      log.warn(`Skipped ${relative(process.cwd(), absolute)}`);
      return;
    }
  }

  const content = scaffoldScenario(scaffold);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
  ensureFile(absolute);
}

function ensureFile(absolute: string): void {
  const s = statSync(absolute);
  if (!s.isFile()) throw new Error(`expected a file at ${absolute}`);
}

export { HELP as SCAFFOLD_HELP };
