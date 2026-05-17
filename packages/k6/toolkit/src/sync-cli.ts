import { relative } from "node:path";

import { sync } from "./sync.js";

const HELP = `
k6-ts sync — generate the typed k6 client from an OpenAPI spec.

USAGE
  k6-ts sync <spec> [--output ./src/gen] [options]
  k6-ts sync - [options]              # read JSON spec from stdin

OPTIONS
  --output <dir>          Where to write client.ts / types.ts / data.ts / index.ts.
                          Default: ./src/gen
  --base-url <url>        DEFAULT_BASE_URL baked into the generated client.
                          Default: spec.servers[0].url
  --scaffold              Also emit one stub loadtest per spec operation under loadtests/.
  --no-normalize          Skip the safe-normalize preset on the input spec.
  --dry-run               Build everything in memory, print results, don't write.
  --report-renames        Diff operationIds against the prior sync's snapshot.
  --help, -h              Show this help.

EXAMPLES
  k6-ts sync ./openapi.yaml --output ./src/gen
  k6-ts sync https://api.example.com/openapi.json --base-url https://staging.example.com
  openapi-recon ./traffic.har | k6-ts sync - --output ./src/gen
`.trim();

interface ParsedArgs {
  input: string;
  output: string;
  baseUrl?: string;
  scaffold: boolean;
  normalize: boolean;
  dryRun: boolean;
  reportRenames: boolean;
  showHelp: boolean;
}

function parseArgs(argv: ReadonlyArray<string>): ParsedArgs {
  let input = "";
  let output = "./src/gen";
  let baseUrl: string | undefined;
  let scaffold = false;
  let normalize = true;
  let dryRun = false;
  let reportRenames = false;
  let showHelp = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      showHelp = true;
      continue;
    }
    if (a === "--scaffold") {
      scaffold = true;
      continue;
    }
    if (a === "--no-normalize") {
      normalize = false;
      continue;
    }
    if (a === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (a === "--report-renames") {
      reportRenames = true;
      continue;
    }
    if (a === "--output") {
      output = expectValue(argv, ++i, "--output");
      continue;
    }
    if (a === "--base-url") {
      baseUrl = expectValue(argv, ++i, "--base-url");
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

  if (!showHelp && !input) {
    throw new Error(
      "Missing input — pass a spec path, URL, or `-` for stdin JSON.",
    );
  }

  return {
    input,
    output,
    baseUrl,
    scaffold,
    normalize,
    dryRun,
    reportRenames,
    showHelp,
  };
}

function expectValue(
  argv: ReadonlyArray<string>,
  idx: number,
  flag: string,
): string {
  const v = argv[idx];
  if (v === undefined || (v.startsWith("-") && v !== "-")) {
    throw new Error(`${flag} requires a value`);
  }
  return v;
}

async function readStdinJson(): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<
    string,
    unknown
  >;
}

export async function runSyncCommand(
  argv: ReadonlyArray<string>,
): Promise<void> {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    console.error(
      `k6-ts sync: ${err instanceof Error ? err.message : String(err)}`,
    );
    console.error("Run `k6-ts sync --help` for usage.");
    process.exit(2);
  }

  if (parsed.showHelp) {
    console.log(HELP);
    return;
  }

  const input = parsed.input === "-" ? await readStdinJson() : parsed.input;

  const result = await sync({
    input,
    output: parsed.output,
    normalize: parsed.normalize,
    defaultBaseUrl: parsed.baseUrl,
    scaffold: parsed.scaffold,
    dryRun: parsed.dryRun,
    reportRenames: parsed.reportRenames,
  });

  const where = relative(process.cwd(), result.output) || result.output;
  const action = parsed.dryRun ? "would write" : "wrote";
  console.error(
    `k6-ts sync: ${action} ${result.files.length} files to ${where}`,
  );

  if (result.diff) {
    for (const r of result.diff.renamed) {
      console.warn(
        `  renamed: ${r.method.toUpperCase()} ${r.path} — ${r.from} → ${r.to}`,
      );
    }
    for (const r of result.diff.removed) {
      console.warn(
        `  removed: ${r.method.toUpperCase()} ${r.path} — ${r.operationId}`,
      );
    }
  }
}
