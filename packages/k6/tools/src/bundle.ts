import { build } from "esbuild";

export interface BundleOpts {
  entry: string;
  outfile: string;
}

/**
 * Bundle the user's loadtest entry into a single ESM file k6 can load.
 * k6 has no module resolution — everything must be inlined except the
 * `k6` / `k6/*` namespaces which are runtime-provided.
 */
export async function bundle(opts: BundleOpts): Promise<void> {
  await build({
    entryPoints: [opts.entry],
    bundle: true,
    platform: "neutral",
    format: "esm",
    target: "es2022",
    outfile: opts.outfile,
    external: ["k6", "k6/*"],
    legalComments: "none",
    logLevel: "error",
  });
}
