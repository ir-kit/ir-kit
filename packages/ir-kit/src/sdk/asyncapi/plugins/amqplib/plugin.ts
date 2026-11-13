import { fileURLToPath } from "node:url";
import { definePluginConfig } from "../../plugin.js";
import { readBundle } from "../../runtime/copy-bundle.js";

import { defaultConfig } from "./config.js";
import type { AmqplibPluginConfig, AmqplibResolvedConfig } from "./types.js";

const bundleDir = fileURLToPath(
  new URL("../../../../../runtime/asyncapi/amqplib/", import.meta.url),
);

/** Emit `assertExchanges` / `bindAndConsume` / `publish` by copying its runtime files. */
export const amqplib = definePluginConfig<
  "amqplib",
  AmqplibPluginConfig,
  AmqplibResolvedConfig,
  unknown
>({
  name: "amqplib",
  defaultConfig,
  dependsOn: ["events"],
  async handler(plugin) {
    for (const file of await readBundle(bundleDir)) {
      plugin.emit(file);
    }
  },
});
