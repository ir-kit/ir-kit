import { $ } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import { safeIdent } from "../../../codegen/index.js";
import { extractEnumValues, fromHeyApi } from "../../../openapi/index.js";
import type { Expr } from "../dsl.js";
import type { BuiltFile } from "../generate.js";
import { toIdent, type WalkedOperation, walkOperations } from "../ir/index.js";
import {
  type LoadtestStubInput,
  renderLoadtestStub,
} from "./loadtest-stub-template.js";

export interface ScaffoldStubsOptions {
  /** Path the stubs import the generated client from. Default: `../index.js`. */
  clientImport?: string;
  /** Subdirectory inside the output dir where stubs land. Default: `loadtests`. */
  dir?: string;
}

/** One loadtest skeleton per operation: import api+data, call op in a flow().step(). */
export function emitLoadtestStubs(
  paths: Parameters<typeof walkOperations>[0],
  schemas: Record<string, unknown> | undefined,
  opts: ScaffoldStubsOptions = {},
): BuiltFile[] {
  const dir = (opts.dir ?? "loadtests").replace(/\/+$/, "");
  const clientImport = opts.clientImport ?? "../index.js";
  const dataImport = clientImport.replace(/index\.js$/, "data.js");
  const knownSchemas = new Set(Object.keys(schemas ?? {}).map(safeIdent));

  const files: BuiltFile[] = [];
  for (const op of walkOperations(paths)) {
    files.push({
      path: `${dir}/${toIdent(op.id)}.ts`,
      content: renderLoadtestStub(
        stubInput(op, clientImport, dataImport, knownSchemas),
      ),
    });
  }
  return files;
}

function stubInput(
  op: WalkedOperation,
  clientImport: string,
  dataImport: string,
  knownSchemas: ReadonlySet<string>,
): LoadtestStubInput {
  return {
    fnName: toIdent(op.id),
    summary: (op.summary ?? `${op.method.toUpperCase()} ${op.path}`)
      .replace(/\s+/g, " ")
      .trim(),
    clientImport,
    dataImport,
    callArgs: callArgExpressions(op, knownSchemas),
  };
}

function callArgExpressions(
  op: WalkedOperation,
  knownSchemas: ReadonlySet<string>,
): Expr[] {
  const args: Expr[] = op.pathParams.map((p) => placeholder(p.schema));
  if (op.queryParams.length) {
    const query = $.object();
    for (const p of op.queryParams) {
      if (p.required) query.prop(p.name, placeholder(p.schema));
    }
    args.push(query);
  }
  if (op.body) args.push(bodyExpression(op, knownSchemas));
  return args;
}

function placeholder(schema: IR.SchemaObject): Expr {
  const [first] = extractEnumValues(fromHeyApi(schema)) ?? [];
  if (
    typeof first === "string" ||
    typeof first === "number" ||
    typeof first === "boolean"
  ) {
    return $.literal(first);
  }
  switch (schema.type) {
    case "integer":
    case "number":
      return $.literal(1);
    case "boolean":
      return $.literal(false);
    case "array":
      return $.array();
    default:
      return $.literal("");
  }
}

function bodyExpression(
  op: WalkedOperation,
  knownSchemas: ReadonlySet<string>,
): Expr {
  const dataName = resolveDataBuilderName(op, knownSchemas);
  return dataName
    ? $("data").attr(dataName).call()
    : $.object().as($.type("any"));
}

function resolveDataBuilderName(
  op: WalkedOperation,
  knownSchemas: ReadonlySet<string>,
): string | undefined {
  const ref = op.body?.schema?.$ref;
  if (ref) {
    const name = safeIdent(ref.split("/").pop() ?? "");
    if (knownSchemas.has(name)) return name;
  }
  const sym = op.body?.schema?.symbolRef?.name;
  if (sym) {
    const name = safeIdent(sym);
    if (knownSchemas.has(name)) return name;
  }
  return undefined;
}
