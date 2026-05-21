import type { IR } from "@hey-api/shared";
import { safeIdent } from "@ir-kit/codegen-core";
import type { HttpMethod } from "@ir-kit/openapi";
import {
  deriveBaseName,
  type LocatedParam,
  operationDocLine,
} from "@ir-kit/openapi";
import {
  type GoFuncParam,
  type GoType,
  goContext,
  goFuncParam,
  goRef,
} from "../../go-dsl/index.js";
import type { TypeCtx } from "../type/index.js";
import { buildBodyParams } from "./body.js";
import { buildNonBodyParams } from "./params.js";
import { returnTypeFor } from "./response.js";

export interface OperationSignature {
  /** The exported Go method name (PascalCase). */
  name: string;
  /** Same name pre-PascalCase — used for synth naming of inline types. */
  ownerName: string;
  params: ReadonlyArray<GoFuncParam>;
  /** `undefined` means "no return value, only error" — the function
   *  results list is just `error`. */
  returnType: GoType | undefined;
  doc: string;
  locatedParams: ReadonlyArray<LocatedParam>;
  op: IR.OperationObject;
  method: HttpMethod;
  pathStr: string;
  securitySchemeNames: ReadonlyArray<string>;
  responseCases: ReadonlyArray<ResponseCase>;
}

/**
 * One arm of a multi-2xx interface return. Populated by `returnTypeFor`
 * when an op declares more than one 2xx response code; the impl
 * dispatches on `resp.StatusCode` to construct the matching concrete
 * type. `caseName` is the Go struct name implementing the response
 * interface; `payloadType` is `undefined` for empty bodies (e.g. 204).
 */
export interface ResponseCase {
  statusCode: string;
  caseName: string;
  payloadType?: GoType;
}

/**
 * One source of truth for `params + returnType + doc` so the interface
 * declaration and the impl method share the same signature shape.
 *
 * The first param is always `ctx context.Context` — Go's idiomatic
 * cancellation/deadline channel; replaces the `timeout` field in
 * Swift / Kotlin's `RequestOptions`. The trailing param is `opts
 * RequestOptions` for everything else (client / baseURL / headers /
 * interceptors / validators / transformers).
 */
export function operationSignature(
  op: IR.OperationObject,
  method: HttpMethod,
  pathStr: string,
  emit: TypeCtx["emit"],
  schemeNames: ReadonlyArray<string> = [],
): OperationSignature {
  const baseName = deriveBaseName(op, method, pathStr);
  const exportedName = safeIdent(baseName);
  const ctx: TypeCtx = { emit, ownerName: exportedName, propPath: [] };

  const { params: nonBody, located } = buildNonBodyParams(op, ctx);
  const bodyParams = op.body ? buildBodyParams(op.body, ctx) : [];
  const params: GoFuncParam[] = [
    goFuncParam("ctx", goContext),
    ...nonBody,
    ...bodyParams,
    goFuncParam("opts", goRef("RequestOptions")),
  ];
  const { type: returnType, cases: responseCases } = returnTypeFor(op, {
    ...ctx,
    propPath: ["response"],
  });

  return {
    name: exportedName,
    ownerName: exportedName,
    params,
    returnType,
    doc: operationDocLine(method, pathStr),
    locatedParams: located,
    op,
    method,
    pathStr,
    securitySchemeNames: schemeNames,
    responseCases,
  };
}
