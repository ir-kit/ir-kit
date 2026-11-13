import { Logger, Project } from "@hey-api/codegen-core";
import { Context, getParser, type IR, parseOpenApiSpec } from "@hey-api/shared";
import { extractSecuritySchemeNames } from "../openapi/index.js";

/**
 * Parse an OpenAPI spec (2.0, 3.0, or 3.1) into hey-api's normalized IR.
 */
export function parseSpec(spec: Record<string, unknown>): IR.Model {
  const context = new Context({
    config: {
      dryRun: true,
      input: [],
      parser: getParser({}),
      plugins: {},
      pluginOrder: [],
    } as unknown as ConstructorParameters<typeof Context>[0]["config"],
    dependencies: {},
    logger: new Logger(),
    project: new Project({ root: "" }),
    spec,
  });
  parseOpenApiSpec(context);
  return context.ir;
}

/** Codegen input: the IR plus each operation's security scheme names, which the IR drops. */
export function parseForCodegen(spec: Record<string, unknown>): {
  ir: IR.Model;
  securitySchemeNames: Map<string, ReadonlyArray<string>>;
} {
  return {
    ir: parseSpec(spec),
    securitySchemeNames: extractSecuritySchemeNames(spec),
  };
}

export type { IR };
