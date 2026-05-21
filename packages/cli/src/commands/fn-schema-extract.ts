import path from "node:path";

import {
  type Dialect,
  type Naming,
  type Params,
  runExtract,
} from "@ir-kit/fn-schema-core";
import { typescript } from "@ir-kit/fn-schema-typescript";
import type { Schema } from "@ir-kit/schema";
import chokidar from "chokidar";
import consola from "consola";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  patterns?: string;
  out?: string;
  bundle?: string;
  bundleTypes?: boolean;
  watch?: boolean;
  openapi?: string;
  tsconfig?: string;
  includeTag?: string;
  excludeName?: string;
  params?: string;
  unwrapPromise?: boolean;
  naming?: string;
  dialect?: string;
  identity?: string;
  transport?: string;
  sourceLocations?: string;
  pretty?: boolean;
  quiet?: boolean;
  cwd?: string;
}

const args: Schema = {
  type: "object",
  properties: {
    patterns: {
      type: "string",
      description: "Glob pattern(s) for source files",
    },
    out: {
      type: "string",
      description: "Output directory (per-signature files)",
    },
    bundle: {
      type: "string",
      description: "Write a single bundled JSON file at this path",
    },
    bundleTypes: {
      type: "boolean",
      description: "When --bundle is set, also emit a sibling .ts wrapper",
      default: false,
    },
    watch: {
      type: "boolean",
      description: "Re-extract on file change",
      default: false,
    },
    openapi: {
      type: "string",
      description: "Write OpenAPI 3.1 components-only document at this path",
    },
    tsconfig: { type: "string", description: "Path to tsconfig.json" },
    includeTag: {
      type: "string",
      description: "Only include functions carrying this JSDoc tag",
    },
    excludeName: {
      type: "string",
      description: "Exclude functions whose name matches this regex",
    },
    params: {
      type: "string",
      description: "Parameter rendering",
      enum: ["array", "first-only", "object"],
    },
    unwrapPromise: {
      type: "boolean",
      description: "Unwrap Promise<T> in return types",
    },
    naming: {
      type: "string",
      description: "Naming strategy",
      enum: ["function-name", "file-function", "jsdoc-tag"],
    },
    dialect: {
      type: "string",
      description: "JSON Schema dialect",
      enum: ["draft-07", "draft-2020-12", "openapi-3.1"],
    },
    identity: {
      type: "string",
      description: "Vendor keyword for originating TS type",
    },
    transport: {
      type: "string",
      description: "Vendor keyword for binary transport hints",
    },
    sourceLocations: {
      type: "string",
      description: "Vendor keyword for file:line:col source locations",
    },
    pretty: {
      type: "boolean",
      description: "Pretty-print JSON output",
      default: false,
    },
    quiet: {
      type: "boolean",
      description: "Suppress non-error logs",
      default: false,
    },
    cwd: { type: "string", description: "Working directory" },
  },
};

export const fnSchemaExtractCommand: CommandSpec<Input, void> = {
  path: ["fn-schema", "extract"],
  description:
    "Extract JSON Schemas from TypeScript function signatures via ts-morph",
  args,
  handler: async (input) => {
    if (input.quiet) consola.level = 1;

    const opts = mapInput(input);
    const once = async (): Promise<number> => {
      consola.start("Extracting...");
      const out = await runExtract(opts);
      if (!out.ok) {
        consola.warn("No files matched.");
        return 0;
      }
      for (const d of out.diagnostics) {
        const msg = d.function ? `[${d.function}] ${d.message}` : d.message;
        if (d.severity === "error") consola.error(msg);
        else if (d.severity === "warning") consola.warn(msg);
        else consola.info(msg);
      }
      for (const w of out.written) consola.success(`Wrote ${w}`);
      consola.box(
        `Found ${out.result.signatures.length} signature(s) in ${out.durationMs}ms` +
          (out.errors > 0 ? ` — ${out.errors} error(s)` : ""),
      );
      return out.errors;
    };

    if (!input.watch) {
      const errors = await once();
      if (errors > 0) process.exitCode = 1;
      return;
    }

    const cwd = path.resolve(input.cwd ?? process.cwd());
    await once();
    consola.info("Watching for changes...");
    const patterns =
      typeof opts.patterns === "string"
        ? [opts.patterns]
        : Array.isArray(opts.patterns)
          ? [...opts.patterns]
          : [];
    let pending: Promise<number> | null = null;
    let queued = false;
    const trigger = (): void => {
      if (pending) {
        queued = true;
        return;
      }
      pending = (async () => {
        try {
          return await once();
        } finally {
          pending = null;
          if (queued) {
            queued = false;
            trigger();
          }
        }
      })();
      void pending;
    };
    const watcher = chokidar.watch(
      patterns.length > 0 ? patterns : ["**/*.ts"],
      {
        cwd,
        ignoreInitial: true,
        ignored: ["**/node_modules/**", "**/__fn_schema_virtual__/**"],
      },
    );
    watcher.on("change", () => trigger());
    watcher.on("add", () => trigger());
    watcher.on("unlink", () => trigger());
    process.on("SIGINT", () => {
      void watcher.close();
      process.exit(0);
    });
  },
};

function mapInput(input: Input): Parameters<typeof runExtract>[0] {
  return {
    cwd: input.cwd,
    patterns: input.patterns,
    tsconfig: input.tsconfig,
    includeTag: input.includeTag,
    excludeName: input.excludeName,
    params: input.params as Params | undefined,
    unwrapPromise: input.unwrapPromise,
    naming: input.naming as Naming | undefined,
    dialect: input.dialect as Dialect | undefined,
    identity: input.identity,
    transport: input.transport,
    sourceLocations: input.sourceLocations,
    outDir: input.out,
    bundlePath: input.bundle,
    bundleTypes: input.bundleTypes,
    openapiPath: input.openapi,
    pretty: input.pretty,
    extractors: [typescript()],
  };
}
