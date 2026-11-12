import { $ } from "@hey-api/openapi-ts";
import type { ClientType } from "../types.js";
import type { ClientGeneratorInput, ClientTypeConfig } from "./types.js";

/**
 * Client type configurations.
 * Maps client types to their external symbols and config.
 */
const CLIENT_TYPE_CONFIGS: Record<ClientType, ClientTypeConfig | null> = {
  openapi: {
    configTypeName: "OpenApiLinkClientConfig",
    functionName: "createOpenApiClient",
    linkImport: "OpenAPILink",
    needsRouter: true, // OpenAPILink requires router as first arg
  },
  rpc: {
    configTypeName: "RpcLinkClientConfig",
    functionName: "createRpcLinkClient",
    linkImport: "RPCLink",
  },
  messageport: {
    configTypeName: "RpcMessagePortClientConfig",
    functionName: "createRpcMessagePortClient",
    linkImport: "RPCLinkMessagePort",
  },
  websocket: {
    configTypeName: "RpcWebSocketClientConfig",
    functionName: "createRpcWebSocketClient",
    linkImport: "RPCLinkWebSocket",
  },
  tanstack: null, // Handled by tanstack generator
};

/**
 * Generates client creation functions for oRPC.
 * Creates type-safe client factory functions based on user configuration.
 */
export const generateClients = ({
  clientTypes,
  context,
}: ClientGeneratorInput): void => {
  const { clientFile, plugin, routerSymbol } = context;

  const contractRouterClientSymbol = plugin.imports.ContractRouterClient;
  const createORPCClientSymbol = plugin.imports.createORPCClient;

  // Filter out tanstack and get configs
  const clientConfigs = clientTypes
    .filter((type) => type !== "tanstack")
    .map((type) => CLIENT_TYPE_CONFIGS[type])
    .filter((config): config is ClientTypeConfig => config !== null);

  // Generate each client
  for (const config of clientConfigs) {
    generateClient(
      plugin,
      routerSymbol,
      clientFile,
      contractRouterClientSymbol,
      createORPCClientSymbol,
      config,
    );
  }

  // Export shared Client type if any clients were generated
  if (clientConfigs.length > 0) {
    const clientTypeSymbol = plugin.symbol("Client", {
      getFilePath: () => clientFile,
      meta: {
        category: "client",
        resource: "client",
        tool: "orpc",
      },
    });

    const clientTypeAlias = $.type
      .alias(clientTypeSymbol)
      .export()
      .type(
        $.type
          .expr(contractRouterClientSymbol)
          .generic($.type.query($(routerSymbol))),
      );

    plugin.node(clientTypeAlias);
  }
};

/**
 * Helper function to generate a single client creation function.
 */
function generateClient(
  plugin: any,
  routerSymbol: any,
  clientFile: string,
  contractRouterClientSymbol: any,
  createORPCClientSymbol: any,
  config: ClientTypeConfig,
): void {
  const {
    configTypeName,
    functionName,
    linkImport,
    needsRouter = false,
  } = config;

  const linkSymbol = plugin.imports[linkImport];

  // ClientConfig type: inferred from Link constructor
  const clientConfigSymbol = plugin.symbol(configTypeName, {
    getFilePath: () => clientFile,
    meta: {
      category: "client",
      resource: configTypeName,
      tool: "orpc",
    },
  });

  // For OpenAPILink, config is the second parameter
  const configParamIndex = needsRouter ? 1 : 0;
  const clientConfigType = $.type.idx(
    $.type.expr("ConstructorParameters").generic($.type.query($(linkSymbol))),
    configParamIndex,
  );

  const clientConfigStatement = $.type
    .alias(clientConfigSymbol)
    .export()
    .type(clientConfigType);

  plugin.node(clientConfigStatement);

  // createClient function
  const createClientSymbol = plugin.symbol(functionName, {
    getFilePath: () => clientFile,
    meta: {
      category: "client",
      resource: functionName,
      tool: "orpc",
    },
  });

  const createClientFunc = $.const(createClientSymbol)
    .export()
    .assign(
      $.func()
        .param("config", (p) => p.type($.type.expr(clientConfigSymbol)))
        .returns(
          $.type
            .expr(contractRouterClientSymbol)
            .generic($.type.query($(routerSymbol))),
        )
        .do(
          // OpenAPILink needs router as first arg: new OpenAPILink(router, config)
          // RPCLink only needs config: new RPCLink(config)
          needsRouter
            ? $.const("link").assign(
                $.new(linkSymbol, $(routerSymbol), $.id("config")),
              )
            : $.const("link").assign($.new(linkSymbol, $.id("config"))),
          $.return($.call(createORPCClientSymbol, $.id("link"))),
        ),
    );

  plugin.node(createClientFunc);
}
