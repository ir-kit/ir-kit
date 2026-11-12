import {
  coerce,
  collectDeps,
  defineConfig as defineConfigTable,
  definePluginConfig,
  type NamingRule,
  resolveNaming,
} from "@hey-api/shared";

import { handler } from "./plugin.js";
import { orpcImports } from "./symbols/external.js";
import type { ORPCPlugin, ServerConfig, UserConfig } from "./types.js";

function resolveHandlers(server: UserConfig["server"]):
  | false
  | {
      dir: string;
      importAlias?: string;
      implementer?: { name: string; from: string };
      mode: import("./types.js").HandlerMode;
      override: boolean;
      faker?: import("./types.js").FakerHandlerConfig;
      proxy?: import("./types.js").ProxyHandlerConfig;
    } {
  const handlers = server?.handlers;
  const implementation = server?.implementation ?? false;
  if (handlers === false) return false;
  if (handlers === true || (handlers === undefined && implementation)) {
    return { dir: "src/handlers", mode: "stub", override: false };
  }
  if (typeof handlers === "object") {
    return {
      dir: handlers.dir ?? "src/handlers",
      importAlias: handlers.importAlias,
      implementer: handlers.implementer,
      mode: handlers.mode ?? "stub",
      override: handlers.override ?? false,
      faker: handlers.faker,
      proxy: handlers.proxy,
    };
  }
  return false;
}

export const defaultConfig: ORPCPlugin["Config"] = {
  config: {
    server: {
      $cascade: ["implementation"],
      implementation: false,
      handlers: coerce((handlers: ServerConfig["handlers"], context: unknown) =>
        resolveHandlers({
          handlers,
          implementation: (context as { implementation?: boolean })
            .implementation,
        }),
      ),
    },
    client: {
      rpc: false,
      websocket: false,
      messageport: false,
      openapi: false,
      tanstack: false,
    },
    comments: true,
    group: "tags",
    includeInEntry: true,
    mode: "compact",
    naming: {
      contract: coerce((rule?: NamingRule) =>
        rule === undefined ? { casing: "PascalCase" } : resolveNaming(rule),
      ),
      operation: coerce((rule?: NamingRule) =>
        rule === undefined ? { casing: "camelCase" } : resolveNaming(rule),
      ),
    },
    validator: {
      $coerceAny: (event) => {
        if (event.type === "string") {
          return { input: event.value, output: event.value };
        }
        if (event.type === "boolean" && !event.value) {
          return { input: false, output: false };
        }
        return {};
      },
      $dependencies: ["input", "output"],
      input: coerce((value?: string | boolean) =>
        value === true || value === undefined ? "zod" : value,
      ),
      output: coerce((value?: string | boolean) =>
        value === true || value === undefined ? "zod" : value,
      ),
    },
  },
  dependencies: ["@hey-api/typescript"],
  handler,
  imports: orpcImports,
  name: "@ir-kit/orpc",
  tags: ["transformer"],
};

/**
 * `definePluginConfig` spreads user config over the default table, so a
 * nested user object replaces its table (losing defaults and coercers).
 * Resolve user config against the table here instead.
 */
const pluginFromDefaults = definePluginConfig(defaultConfig);
const normalizeConfig = defineConfigTable<
  Record<string, unknown>,
  Record<string, unknown>
>(defaultConfig.config as never);

export const defineConfig = (
  userConfig?: Parameters<typeof pluginFromDefaults>[0],
) => {
  const plugin = pluginFromDefaults();
  const config = normalizeConfig({ ...userConfig });
  const dependencies = new Set<string>(defaultConfig.dependencies);
  collectDeps(defaultConfig.config as never, config, dependencies);
  return {
    ...plugin,
    config: config as typeof plugin.config,
    dependencies: [...dependencies] as typeof plugin.dependencies,
  };
};
