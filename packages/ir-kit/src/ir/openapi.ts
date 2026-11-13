import { Logger, Project } from "@hey-api/codegen-core";
import { Context, getParser, parseOpenApiSpec } from "@hey-api/shared";

import type { Method, Model, Operation, PathItem, Paths } from "./model.js";

/**
 * Lower an OpenAPI 2.0, 3.0 or 3.1 document into ir-kit's model.
 *
 * Hey API's parser does the schema and parameter work. Its output drops
 * security scheme names, so those are read from the document here.
 */
export function parseOpenAPI(spec: Record<string, unknown>): Model {
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
  const { paths, ...rest } = context.ir;
  const lowered: Paths = {};
  for (const [path, item] of Object.entries(paths ?? {})) {
    const ops: PathItem = {};
    for (const [method, op] of Object.entries(item) as [
      Method,
      Omit<Operation, "securitySchemes"> | undefined,
    ][]) {
      if (!op) continue;
      ops[method] = {
        ...op,
        securitySchemes: securitySchemes(spec, path, method),
      };
    }
    lowered[path as keyof Paths] = ops;
  }
  return { ...rest, paths: lowered };
}

type Requirement = Record<string, unknown>;

function securitySchemes(
  spec: Record<string, unknown>,
  path: string,
  method: Method,
): string[] {
  const paths = spec.paths as Record<string, unknown> | undefined;
  const item = resolve(spec, paths?.[path]);
  const op = resolve(spec, item?.[method]);
  const requirements = (op?.security ?? spec.security ?? []) as Requirement[];
  const names = new Set<string>();
  for (const requirement of requirements) {
    for (const name of Object.keys(requirement ?? {})) names.add(name);
  }
  return [...names];
}

function resolve(
  spec: Record<string, unknown>,
  value: unknown,
): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const ref = (value as { $ref?: unknown }).$ref;
  if (typeof ref !== "string" || !ref.startsWith("#/")) {
    return value as Record<string, unknown>;
  }
  let target: unknown = spec;
  for (const part of ref.slice(2).split("/")) {
    const key = part.replaceAll("~1", "/").replaceAll("~0", "~");
    target = (target as Record<string, unknown> | undefined)?.[key];
  }
  return resolve(spec, target);
}
