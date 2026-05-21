import { safeIdent } from "@ir-kit/codegen-core";
import ts from "typescript";

import type { BuiltFile } from "../generate.js";
import { toIdent, type WalkedOperation, walkOperations } from "../ir/index.js";
import {
  type LoadtestStubInput,
  renderLoadtestStub,
} from "./loadtest-stub-template.js";

const f = ts.factory;

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
    summary: op.summary ?? `${op.method.toUpperCase()} ${op.path}`,
    clientImport,
    dataImport,
    callArgs: callArgExpressions(op, knownSchemas),
  };
}

function callArgExpressions(
  op: WalkedOperation,
  knownSchemas: ReadonlySet<string>,
): ts.Expression[] {
  const args: ts.Expression[] = [];
  for (const p of op.pathParams) args.push(pathParamPlaceholder(p));
  if (op.queryParams.length)
    args.push(f.createObjectLiteralExpression([], false));
  if (op.body) args.push(bodyExpression(op, knownSchemas));
  return args;
}

function pathParamPlaceholder(p: {
  schema?: { type?: string };
}): ts.Expression {
  switch (p.schema?.type) {
    case "integer":
    case "number":
      return f.createNumericLiteral("1");
    case "boolean":
      return f.createFalse();
    default:
      return f.createStringLiteral("");
  }
}

function bodyExpression(
  op: WalkedOperation,
  knownSchemas: ReadonlySet<string>,
): ts.Expression {
  const dataName = resolveDataBuilderName(op, knownSchemas);
  if (dataName) {
    return f.createCallExpression(
      f.createPropertyAccessExpression(
        f.createIdentifier("data"),
        f.createIdentifier(dataName),
      ),
      undefined,
      [],
    );
  }
  return f.createAsExpression(
    f.createObjectLiteralExpression([], false),
    f.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
  );
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
