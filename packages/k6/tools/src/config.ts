import { loadConfig } from "c12";

export interface K6ToolsConfig {
  /** Path to the OpenAPI spec used by `sync`. */
  spec?: string;
  /** Output directory for the generated client. Default: `./src/gen`. */
  output?: string;
  /** Path to the user's loadtest entry. Default: `./loadtest.ts`. */
  loadtest?: string;
  /** Default base URL baked into the generated client (overridable via `__ENV.BASE_URL`). */
  defaultBaseUrl?: string;
  /** Apply the safe-normalize preset before codegen. Default: `true`. */
  normalize?: boolean;
}

/** Helper for typed config files: `export default defineConfig({...})`. */
export function defineConfig(config: K6ToolsConfig): K6ToolsConfig {
  return config;
}

export async function loadK6ToolsConfig(cwd: string): Promise<K6ToolsConfig> {
  const { config } = await loadConfig<K6ToolsConfig>({
    cwd,
    name: "k6-tools",
    defaults: {
      output: "./src/gen",
      loadtest: "./loadtest.ts",
      normalize: true,
    },
  });
  return config ?? {};
}
