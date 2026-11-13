import type { Symbol } from "@hey-api/codegen-core";
import type { PluginInstance } from "@hey-api/shared";

const external = (
  plugin: PluginInstance,
  name: string,
  module: string,
  resource = `${module}.${name}`,
): Symbol =>
  plugin.symbolFactory.register(name, {
    external: module,
    meta: { category: "external", resource },
  });

export const orpcImports = (plugin: PluginInstance) => ({
  ContractRouterClient: external(
    plugin,
    "ContractRouterClient",
    "@orpc/contract",
  ),
  OpenAPILink: external(plugin, "OpenAPILink", "@orpc/openapi-client/fetch"),
  RPCLink: external(plugin, "RPCLink", "@orpc/client/fetch"),
  RPCLinkMessagePort: external(plugin, "RPCLink", "@orpc/client/message-port"),
  RPCLinkWebSocket: external(plugin, "RPCLink", "@orpc/client/websocket"),
  createORPCClient: external(plugin, "createORPCClient", "@orpc/client"),
  createTanstackQueryUtils: external(
    plugin,
    "createTanstackQueryUtils",
    "@orpc/tanstack-query",
  ),
  faker: external(plugin, "faker", "@faker-js/faker"),
  implement: external(plugin, "implement", "@orpc/server"),
  oc: external(plugin, "oc", "@orpc/contract"),
  oz: external(plugin, "oz", "@orpc/zod"),
});

export type ORPCImports = ReturnType<typeof orpcImports>;
