import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import type { GenerateOptions, GenerateResult } from "@ahmedrowaihi/k6-gen";
import type { IR } from "@ahmedrowaihi/openapi-tools";

import {
  type AuthFlavor,
  type ScaffoldLoadtestOpts,
  scaffoldLoadtest,
} from "./loadtest-scaffold.js";
import { sync } from "./sync.js";

export type { AuthFlavor } from "./loadtest-scaffold.js";

export interface InitOptions
  extends Pick<
    GenerateOptions,
    "input" | "normalize" | "defaultBaseUrl" | "scaffold"
  > {
  /** Project root. Default: `process.cwd()`. */
  cwd?: string;
  /** Output directory for the generated client. Default: `./src/gen`. */
  output?: string;
  /** Where the loadtest scaffold lands. Default: `./loadtest.ts`. */
  loadtestPath?: string;
  /** Auth recipe wired into the scaffold. Default: `"none"`. */
  auth?: AuthFlavor;
  /** Env var holding the bearer token (only used when `auth === "bearer"`). */
  bearerEnv?: string;
  /** Header name for the API key (only used when `auth === "apiKey"`). */
  apiKeyHeader?: string;
  /** Env var holding the API key (only used when `auth === "apiKey"`). */
  apiKeyEnv?: string;
  /** Pace preset baked into the scaffold. Default: `"smoke"`. */
  pace?: ScaffoldLoadtestOpts["pace"];
  /** Scaffold pace duration string. Default: `"30s"`. */
  duration?: string;
  /**
   * When set, emit `scenarios: { … }` with one entry per name instead of
   * the single-pace shape. Each scenario gets its own pace + flow.
   */
  scenarios?: ReadonlyArray<string>;
  /** Refuse to overwrite an existing loadtest file. Default: `true`. */
  noOverwrite?: boolean;
  /** Don't touch disk — return what would have been written. */
  dryRun?: boolean;
}

export interface InitFile {
  path: string;
  content: string;
  /** `false` when `dryRun` set or `noOverwrite` skipped the write. */
  written: boolean;
}

export interface InitResult {
  files: InitFile[];
  generated: GenerateResult;
}

/**
 * Scaffold a fresh k6 project: generate the typed client and emit a
 * starter `loadtest.ts` parameterized on `auth` / `pace` / `scenarios`.
 * The first param-less GET operation seeds the flow step so the file
 * runs out of the box.
 */
export async function init(opts: InitOptions): Promise<InitResult> {
  const cwd = opts.cwd ?? process.cwd();
  const output = resolve(cwd, opts.output ?? "./src/gen");
  const loadtestPath = resolve(cwd, opts.loadtestPath ?? "./loadtest.ts");
  const auth: AuthFlavor = opts.auth ?? "none";

  const generated = await sync({
    input: opts.input,
    output,
    cwd,
    normalize: opts.normalize ?? true,
    defaultBaseUrl: opts.defaultBaseUrl,
    scaffold: opts.scaffold,
    dryRun: opts.dryRun,
  });

  const content = scaffoldLoadtest({
    clientImportPath: relativeClientImport(loadtestPath, output),
    auth,
    bearerEnv: opts.bearerEnv,
    apiKeyHeader: opts.apiKeyHeader,
    apiKeyEnv: opts.apiKeyEnv,
    pace: opts.pace,
    duration: opts.duration,
    scenarios: opts.scenarios,
    seedOperation: pickSeedOperation(generated.ir),
  });

  const exists = existsSync(loadtestPath);
  const shouldSkip = exists && (opts.noOverwrite ?? true);
  let written = false;

  if (!opts.dryRun && !shouldSkip) {
    await mkdir(dirname(loadtestPath), { recursive: true });
    await writeFile(loadtestPath, content);
    written = true;
  }

  return {
    files: [{ path: loadtestPath, content, written }],
    generated,
  };
}

function relativeClientImport(loadtestPath: string, outputDir: string): string {
  const rel = relative(dirname(loadtestPath), outputDir).replaceAll("\\", "/");
  return `./${rel || "."}/index.js`;
}

/** First GET op with no required path params + no required body. */
function pickSeedOperation(ir: IR.Model): string | undefined {
  const paths = (ir as { paths?: Record<string, Record<string, unknown>> })
    .paths;
  if (!paths) return undefined;
  for (const pathItem of Object.values(paths)) {
    const op = pathItem?.get as
      | {
          id?: string;
          parameters?: { path?: Record<string, { required?: boolean }> };
          body?: { required?: boolean };
        }
      | undefined;
    if (!op?.id) continue;
    const requiredPathParams = Object.values(op.parameters?.path ?? {}).filter(
      (p) => p.required,
    );
    if (requiredPathParams.length > 0) continue;
    if (op.body?.required) continue;
    return op.id;
  }
  return undefined;
}
