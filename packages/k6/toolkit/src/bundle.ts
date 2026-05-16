import { resolve } from "node:path";

import { build, type UserConfig } from "tsdown";

/**
 * Anything tsdown's `build()` accepts. Consumers can pass plugins,
 * watch, dts, target — full Rolldown surface. `entry` is required.
 */
export type BundleOpts = UserConfig & {
  entry: NonNullable<UserConfig["entry"]>;
};

export interface BundleResult {
  /** Absolute path to the entry chunk — feed straight into `k6 run`. */
  outfile: string;
  /** Every chunk emitted (debug / multi-entry use cases). */
  chunks: ReadonlyArray<{ fileName: string; isEntry: boolean }>;
}

const K6_EXTERNAL_DEFAULTS: ReadonlyArray<string | RegExp> = ["k6", /^k6\//];

const DEFAULTS: UserConfig = {
  format: "esm",
  target: "es2022",
  platform: "neutral",
  external: [...K6_EXTERNAL_DEFAULTS],
  logLevel: "error",
  dts: false,
};

/**
 * Bundle a k6 loadtest entry into a single ESM file the k6 binary can
 * load. Defaults target k6's VM (es2022 + neutral platform + external
 * `k6` / `k6/*`). All tsdown options pass through; arrays/strings in
 * `external` are concatenated with the k6 defaults.
 */
export async function bundle(opts: BundleOpts): Promise<BundleResult> {
  const merged: UserConfig = {
    ...DEFAULTS,
    ...opts,
    external: mergeExternal(opts.external),
  };

  const [bundle] = await build(merged);
  if (!bundle) throw new Error("tsdown produced no bundle");

  const entryChunk = bundle.chunks.find(isEntryChunk);
  if (!entryChunk) {
    throw new Error("tsdown produced no entry chunk — check your entry config");
  }

  const outDir = bundle.config.outDir ?? "dist";
  return {
    outfile: resolve(outDir, entryChunk.fileName),
    chunks: bundle.chunks.map((c) => ({
      fileName: c.fileName,
      isEntry: isEntryChunk(c),
    })),
  };
}

function isEntryChunk(chunk: {
  type: string;
  isEntry?: boolean;
}): chunk is { type: "chunk"; isEntry: true; fileName: string } & typeof chunk {
  return chunk.type === "chunk" && chunk.isEntry === true;
}

function mergeExternal(user: UserConfig["external"]): UserConfig["external"] {
  if (user === undefined) return [...K6_EXTERNAL_DEFAULTS];
  if (typeof user === "function") {
    return (id, parentId, isResolved) => {
      for (const marker of K6_EXTERNAL_DEFAULTS) {
        if (marker instanceof RegExp ? marker.test(id) : marker === id) {
          return true;
        }
      }
      return user(id, parentId, isResolved);
    };
  }
  const userArr = Array.isArray(user) ? user : [user];
  return [...K6_EXTERNAL_DEFAULTS, ...userArr];
}
