import { pascal } from "@ir-kit/codegen-core";
import {
  classifyBody,
  classifyEnumLiterals,
  classifyReturnShape,
  collectLocatedParams,
  deriveBaseName,
  extractEnumValues,
  fromHeyApi,
  iterateObjectProperties,
  iterOperations,
  type ObjectProperty,
  operationDocLine,
  type Schema,
  schemaTypeName,
} from "@ir-kit/openapi";
import { parseSpec } from "@ir-kit/openapi-tools";
import { mergeObjectAllOf } from "./allof.js";
import {
  isMessageType,
  type ProtoFile,
  type ProtoService,
  type ProtoType,
  protoEmpty,
} from "./ast.js";
import { newTypeNames, packageIdent } from "./names.js";
import { createProtoOps, type ProtoOps, type ProtoState } from "./ops.js";
import { printProtoFile } from "./print.js";

export interface OpenAPIToProtoOptions {
  /** Protobuf package. Defaults to the snake_cased `info.title`. */
  package?: string;
}

/**
 * Build a proto3 file from an OpenAPI document: one message or enum per
 * component schema, and one gRPC service per operation tag with an RPC
 * per operation. Each RPC's request message holds the operation's
 * parameters plus a `body` field; its response is the 2xx schema.
 */
export function openAPIToProto(
  document: Record<string, unknown>,
  options: OpenAPIToProtoOptions = {},
): string {
  const doc = structuredClone(document);
  mergeObjectAllOf(doc);
  const ir = parseSpec(doc);
  const info = isRecord(doc.info) ? doc.info : {};
  const title = typeof info.title === "string" ? info.title : undefined;
  const pkg = options.package ?? packageIdent(title);
  if (!/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(pkg)) {
    throw new Error(`openapi3→proto: invalid package name "${pkg}"`);
  }

  const state: ProtoState = {
    names: newTypeNames(),
    enumValues: new Set(),
    enums: new Set(),
    aliases: new Map(),
    decls: [],
  };
  const ops = createProtoOps(state);

  const components = Object.entries(ir.components?.schemas ?? {}).map(
    ([raw, hey]) => ({
      name: schemaTypeName(state.names, raw),
      schema: fromHeyApi(hey),
    }),
  );
  // Classify every component before generating any of them, so forward
  // references know whether they point at an enum or an inlined alias.
  for (const { name, schema } of components) {
    if (isStringEnum(schema)) state.enums.add(name);
    else if (!ops.isMessageShape(schema)) state.aliases.set(name, schema);
  }
  for (const { name, schema } of components) {
    if (isStringEnum(schema)) {
      ops.emitStringEnum(
        name,
        extractEnumValues(schema) as string[],
        (d) => state.decls.push({ ...d, comment: schema.description }),
        state.names,
      );
    } else if (state.aliases.has(name)) {
      ops.refType(name);
    } else {
      state.decls.push(namedMessage(ops, name, schema));
    }
  }

  const services = buildServices(ir.paths, ops, state, title);
  const file: ProtoFile = { package: pkg, decls: state.decls, services };
  return printProtoFile(file);
}

function buildServices(
  paths: Parameters<typeof iterOperations>[0],
  ops: ProtoOps,
  state: ProtoState,
  title: string | undefined,
): ProtoService[] {
  const services = new Map<string, ProtoService>();
  const rpcNames = new Map<string, ReturnType<typeof newTypeNames>>();

  for (const { pathStr, method, op } of iterOperations(paths)) {
    const tag = op.tags?.[0];
    const serviceName = state.names.claim(
      `service:${tag ?? ""}`,
      `${tag ?? title ?? "Api"}Service`,
    );
    let service = services.get(serviceName);
    if (!service) {
      service = { name: serviceName, rpcs: [] };
      services.set(serviceName, service);
      rpcNames.set(serviceName, newTypeNames());
    }
    const opKey = `${method} ${pathStr}`;
    const rpc = rpcNames
      .get(serviceName)!
      .claim(opKey, deriveBaseName(op, method, pathStr));

    const properties: ObjectProperty[] = collectLocatedParams(op).map(
      ({ param }) => {
        const schema = fromHeyApi(param.schema);
        return {
          jsonKey: param.name,
          schema: {
            ...schema,
            description: param.description ?? schema.description,
            deprecated: param.deprecated ?? schema.deprecated,
          },
          required: param.required ?? false,
          isBinary: false,
          propPathSegment: pascal(param.name),
        };
      },
    );
    if (op.body) {
      const body = classifyBody(op.body);
      properties.push({
        jsonKey: "body",
        schema:
          body.shape.kind === "opaque"
            ? { type: "string", format: "binary" }
            : body.schema,
        required: op.body.required ?? false,
        isBinary: body.shape.kind === "opaque",
        propPathSegment: "Body",
      });
    }
    let request: ProtoType = protoEmpty;
    if (properties.length > 0) {
      const name = state.names.claim(`rpc:${opKey}:request`, `${rpc}Request`);
      state.decls.push(ops.message(name, properties));
      request = ops.refType(name);
    }

    service.rpcs.push({
      name: rpc,
      request,
      response: responseType(op, opKey, rpc, ops, state),
      deprecated: op.deprecated,
      comment: [op.summary, op.description, operationDocLine(method, pathStr)]
        .filter((s): s is string => Boolean(s?.trim()))
        .join("\n\n"),
    });
  }
  return [...services.values()];
}

function responseType(
  op: Parameters<typeof classifyReturnShape>[0],
  opKey: string,
  rpc: string,
  ops: ProtoOps,
  state: ProtoState,
): ProtoType {
  const shape = classifyReturnShape(op);
  const claim = () =>
    state.names.claim(`rpc:${opKey}:response`, `${rpc}Response`);

  let schema: Schema | undefined;
  if (shape.kind === "single") schema = shape.schema;
  if (shape.kind === "multi") {
    const cases = shape.cases.filter(
      (c): c is { statusCode: string; schema: Schema } =>
        c.schema !== undefined,
    );
    const distinct = new Set(cases.map((c) => JSON.stringify(c.schema)));
    if (distinct.size === 1) schema = cases[0]!.schema;
    if (distinct.size > 1) {
      // One branch per status code, so callers can tell 200 from 202.
      const name = claim();
      state.decls.push(
        ops.oneofMessage(
          name,
          { oneOf: cases.map((c) => c.schema) },
          cases.map((c) => `status_${c.statusCode}`),
        ),
      );
      return ops.refType(name);
    }
  }
  if (!schema) return protoEmpty;

  if (schema.$ref) {
    const target = ops.dispatch(schema, ops.ctx(rpc));
    if (isMessageType(target)) return target;
  }
  const name = claim();
  state.decls.push(
    ops.isMessageShape(schema)
      ? namedMessage(ops, name, schema)
      : ops.wrapperMessage(
          name,
          ops.dispatch(schema, ops.ctx(name, ["Value"])),
        ),
  );
  return ops.refType(name);
}

/** Message declared under `name` for an object or multi-branch union. */
function namedMessage(ops: ProtoOps, name: string, schema: Schema) {
  if (schema.type === "object" && !schema.oneOf && !schema.anyOf) {
    return ops.message(
      name,
      Array.from(iterateObjectProperties(schema)),
      schema.description,
    );
  }
  return ops.oneofMessage(name, schema);
}

function isStringEnum(schema: Schema): boolean {
  const values = extractEnumValues(schema);
  return (
    !schema.$ref &&
    values !== undefined &&
    values.length > 0 &&
    classifyEnumLiterals(
      values.filter(
        (v): v is string | number | boolean =>
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean",
      ),
    ) === "string"
  );
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
