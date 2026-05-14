import { definePluginConfig } from "@hey-api/shared";

import { handler } from "./plugin.js";
import type { K6HeyApiPlugin } from "./types.js";

export const defaultConfig: K6HeyApiPlugin["Config"] = {
  config: {
    output: "./k6",
  },
  dependencies: [],
  handler,
  name: "@ahmedrowaihi/openapi-ts-k6",
  tags: ["client"],
};

export const defineConfig = definePluginConfig(defaultConfig);
