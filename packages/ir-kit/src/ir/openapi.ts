import { Logger, Project } from "@hey-api/codegen-core";
import { Context, getParser, parseOpenApiSpec } from "@hey-api/shared";

import { fromHeyApi, type HeyApiSchema } from "../schema/adapters/heyapi.js";
import type {
  Body,
  Components,
  Method,
  Model,
  Operation,
  Parameter,
  Parameters,
  PathItem,
  Paths,
  Response,
  Responses,
} from "./model.js";

/**
 * Lower an OpenAPI 2.0, 3.0 or 3.1 document into ir-kit's model.
 *
 * Hey API's parser does the schema and parameter work. Its schemas are
 * converted to JSON Schema here, and the security scheme names it drops are
 * read from the document.
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
  const { paths, components, ...rest }: HeyApiModel = context.ir;
  const lowered: Paths = {};
  for (const [path, item] of Object.entries(paths ?? {})) {
    const ops: PathItem = {};
    for (const [method, op] of Object.entries(item) as [
      Method,
      HeyApiOperation | undefined,
    ][]) {
      if (!op) continue;
      ops[method] = {
        ...op,
        parameters: op.parameters && lowerParameters(op.parameters),
        body: op.body && { ...op.body, schema: fromHeyApi(op.body.schema) },
        responses: op.responses && lowerResponses(op.responses),
        securitySchemes: securitySchemes(spec, path, method),
      };
    }
    lowered[path as keyof Paths] = ops;
  }
  return {
    ...rest,
    components: components && lowerComponents(components),
    paths: lowered,
  };
}

type WithHeySchema<T> = Omit<T, "schema"> & { schema: HeyApiSchema };
type HeyApiParameter = WithHeySchema<Parameter>;
type HeyApiParameters = {
  [L in keyof Parameters]?: Record<string, HeyApiParameter>;
};
type HeyApiOperation = Omit<
  Operation,
  "securitySchemes" | "parameters" | "body" | "responses"
> & {
  parameters?: HeyApiParameters;
  body?: WithHeySchema<Body>;
  responses?: Record<string, WithHeySchema<Response> | undefined>;
};
interface HeyApiModel extends Omit<Model, "paths" | "components"> {
  paths?: { [P in keyof Paths]: { [M in Method]?: HeyApiOperation } };
  components?: {
    schemas?: Record<string, HeyApiSchema>;
    parameters?: Record<string, HeyApiParameter>;
    requestBodies?: Record<
      string,
      WithHeySchema<{ required?: boolean; description?: string }>
    >;
  };
}

function mapValues<A, B>(
  record: Record<string, A>,
  fn: (value: A) => B,
): Record<string, B> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, fn(value)]),
  );
}

function lowerParameter(param: HeyApiParameter): Parameter {
  return { ...param, schema: fromHeyApi(param.schema) };
}

function lowerParameters(params: HeyApiParameters): Parameters {
  const out: Parameters = {};
  for (const [location, byName] of Object.entries(params) as [
    keyof Parameters,
    Record<string, HeyApiParameter> | undefined,
  ][]) {
    if (byName) out[location] = mapValues(byName, lowerParameter);
  }
  return out;
}

function lowerResponses(
  responses: NonNullable<HeyApiOperation["responses"]>,
): Responses {
  return mapValues(
    responses,
    (r) => r && { ...r, schema: fromHeyApi(r.schema) },
  );
}

function lowerComponents(
  components: NonNullable<HeyApiModel["components"]>,
): Components {
  const { schemas, parameters, requestBodies } = components;
  return {
    ...components,
    schemas: schemas && mapValues(schemas, fromHeyApi),
    parameters: parameters && mapValues(parameters, lowerParameter),
    requestBodies:
      requestBodies &&
      mapValues(requestBodies, (b) => ({ ...b, schema: fromHeyApi(b.schema) })),
  };
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
  const { $ref: _, ...siblings } = value as Record<string, unknown>;
  return { ...resolve(spec, target), ...siblings };
}
