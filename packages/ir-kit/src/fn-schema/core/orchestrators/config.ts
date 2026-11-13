import { findConfigFile, importConfig } from "../../../config-file.js";
import type { ExtractOptions } from "../types.js";

export interface FnSchemaConfig
  extends Omit<ExtractOptions, "files" | "source" | "targets"> {
  files?: string | ReadonlyArray<string>;
  out?: string;
  format?: "json" | "json-pretty" | "bundle" | "openapi";
  typescript?: Record<string, unknown>;
}

export async function loadFnSchemaConfig(cwd: string): Promise<FnSchemaConfig> {
  const file = findConfigFile(cwd, "fn-schema");
  return file ? ((await importConfig<FnSchemaConfig>(file)) ?? {}) : {};
}
