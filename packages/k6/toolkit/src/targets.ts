import { basename, dirname, extname, resolve } from "node:path";

import { glob } from "tinyglobby";

export interface RunTarget {
  /** Display label ("default" for single-loadtest, else stem or named key). */
  name: string;
  /** Absolute path to the source entry. */
  entry: string;
  /** Absolute path the bundle should be written to. */
  outfile: string;
}

export interface ResolveTargetsOpts {
  cwd: string;
  /** Highest-precedence: a single positional entry path. */
  entry?: string;
  /** Glob pattern relative to cwd; expands to one target per match. */
  pattern?: string;
  /** Named-map from config — `{ browse: "./browse.ts", write: … }`. */
  loadtests?: Record<string, string>;
  /** Filter `loadtests` to a subset; throws if a name is unknown. */
  name?: string | ReadonlyArray<string>;
  /** Single fallback loadtest path. Default: `./loadtest.ts`. */
  loadtest?: string;
  /** Bundle output dir. Default: `./dist` resolved against cwd. */
  outDir?: string;
}

// Precedence: entry → pattern → loadtests (filtered by name) → loadtest → ./loadtest.ts.
export async function resolveTargets(
  opts: ResolveTargetsOpts,
): Promise<RunTarget[]> {
  const cwd = opts.cwd;
  const outDir = opts.outDir
    ? resolve(cwd, opts.outDir)
    : resolve(cwd, "./dist");
  const singleOutfile = resolve(outDir, "loadtest.js");

  if (opts.entry) {
    return [
      {
        name: "default",
        entry: resolve(cwd, opts.entry),
        outfile: singleOutfile,
      },
    ];
  }

  if (opts.pattern) {
    const matches = await glob(opts.pattern, { cwd, absolute: true });
    matches.sort();
    return matches.map((entry: string) => ({
      name: stem(entry),
      entry,
      outfile: bundlePath(outDir, entry),
    }));
  }

  if (opts.loadtests && Object.keys(opts.loadtests).length > 0) {
    return resolveNamed(cwd, opts.loadtests, opts.name, outDir);
  }

  if (opts.name !== undefined) {
    const wanted = Array.isArray(opts.name) ? opts.name.join(", ") : opts.name;
    throw new Error(
      `name "${wanted}" was provided but no \`loadtests\` map is configured.`,
    );
  }

  return [
    {
      name: "default",
      entry: resolve(cwd, opts.loadtest ?? "./loadtest.ts"),
      outfile: singleOutfile,
    },
  ];
}

function resolveNamed(
  cwd: string,
  loadtests: Record<string, string>,
  nameArg: string | ReadonlyArray<string> | undefined,
  outDir: string,
): RunTarget[] {
  const wanted =
    typeof nameArg === "string"
      ? [nameArg]
      : Array.isArray(nameArg)
        ? nameArg
        : [];

  const entries = wanted.length
    ? wanted.map((n) => {
        const path = loadtests[n];
        if (!path) {
          throw new Error(`No loadtest named "${n}" in loadtests map.`);
        }
        return [n, path] as const;
      })
    : Object.entries(loadtests);

  return entries.map(([name, path]) => ({
    name,
    entry: resolve(cwd, path),
    outfile: bundlePath(outDir, resolve(cwd, path), name),
  }));
}

function stem(entry: string): string {
  return basename(entry, extname(entry));
}

function bundlePath(outDir: string, entry: string, name?: string): string {
  return resolve(outDir, `${name ?? stem(entry)}.js`);
}

/** Used by CLI to derive `outDir` from a single `--outfile` flag. */
export function outDirFor(outfile: string): string {
  return dirname(outfile);
}
