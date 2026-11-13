import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { findConfigFile, importConfig } from "../config-file.js";
import type { IrConfig } from "./config.js";

export interface LoadedConfig {
  config: IrConfig;
  /** Absolute path of the config file. */
  file: string;
  /** Directory relative paths in the config start from. */
  cwd: string;
}

export async function loadIrConfig(
  opts: { cwd?: string; configFile?: string } = {},
): Promise<LoadedConfig> {
  const cwd = resolve(opts.cwd ?? process.cwd());
  const file = opts.configFile
    ? resolve(cwd, opts.configFile)
    : findConfigFile(cwd, "ir");
  if (!file || !existsSync(file)) {
    throw new Error(
      opts.configFile
        ? `${opts.configFile} not found.`
        : `No ir.config.ts found in ${cwd}. Create one with: ir init`,
    );
  }
  const config = await importConfig<IrConfig>(file);
  if (!config?.targets) throw new Error(`No targets found in ${file}.`);
  return { config, file, cwd: dirname(file) };
}
