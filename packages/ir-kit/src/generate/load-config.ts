import { dirname, resolve } from "node:path";
import { loadConfig as loadC12 } from "c12";

import type { IrConfig } from "./config.js";

export interface LoadedConfig {
  config: IrConfig;
  /** Absolute path of the config file. */
  file: string;
  /** Directory relative paths in the config start from. */
  cwd: string;
}

/**
 * Find and load `ir.config.{ts,mts,js,mjs,json,yaml}` in `cwd`, or the
 * file at `configFile` when given.
 */
export async function loadIrConfig(
  opts: { cwd?: string; configFile?: string } = {},
): Promise<LoadedConfig> {
  const cwd = resolve(opts.cwd ?? process.cwd());
  const { config, _configFile: file } = await loadC12<IrConfig>({
    cwd,
    name: "ir",
    configFile: opts.configFile ? resolve(cwd, opts.configFile) : undefined,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
  });
  if (!config?.targets || !file) {
    throw new Error(
      opts.configFile
        ? `No targets found in ${opts.configFile}.`
        : `No ir.config.ts found in ${cwd}. Create one with: ir init`,
    );
  }
  return { config, file, cwd: dirname(file) };
}
