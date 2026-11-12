import { coerce, type NamingRule, resolveNaming } from "@hey-api/shared";
import { definePlugin } from "@ir-kit/openapi-ts-plugin-kit";

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

export const defineConfig = definePlugin(defaultConfig);
