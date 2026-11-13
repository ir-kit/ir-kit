import { loadConfig } from "c12";

import type { ExtractOptions } from "../types.js";

export interface FnSchemaConfig
  extends Omit<ExtractOptions, "files" | "source" | "targets"> {
  files?: string | ReadonlyArray<string>;
  out?: string;
  format?: "json" | "json-pretty" | "bundle" | "openapi";
  typescript?: Record<string, unknown>;
}

export async function loadFnSchemaConfig(cwd: string): Promise<FnSchemaConfig> {
  const { config } = await loadConfig<FnSchemaConfig>({
    cwd,
    name: "fn-schema",
    defaults: {},
  });
  return config ?? {};
}
