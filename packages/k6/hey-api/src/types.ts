import type {} from "@hey-api/openapi-ts";
import type { DefinePlugin, Plugin } from "@hey-api/shared";

export type UserConfig = Plugin.Hooks &
  Plugin.UserExports & {
    name: "@ahmedrowaihi/openapi-ts-k6";
    /**
     * Output directory for the generated client (`types.ts`, `client.ts`,
     * `data.ts`, `index.ts`). Resolved relative to hey-api's `output.path`.
     * @default "./k6"
     */
    output?: string;
    /**
     * Default base URL baked into the client. Falls back to spec
     * `servers[0].url`. The user can still override at runtime via
     * `__ENV.BASE_URL`.
     */
    defaultBaseUrl?: string;
  };

export type Config = Plugin.Hooks &
  Plugin.Exports & {
    name: "@ahmedrowaihi/openapi-ts-k6";
    output: string;
    defaultBaseUrl?: string;
  };

export type K6HeyApiPlugin = DefinePlugin<UserConfig, Config>;

declare module "@hey-api/openapi-ts" {
  export interface PluginConfigMap {
    "@ahmedrowaihi/openapi-ts-k6": K6HeyApiPlugin["Types"];
  }
}
