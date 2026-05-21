import type { IR } from "@hey-api/shared";
import { camel, pascal } from "@ir-kit/codegen-core";
import type { HttpMethod } from "@ir-kit/openapi";
import {
  deriveBaseName,
  type LocatedParam,
  operationDocLine,
} from "@ir-kit/openapi";
import {
  type KtFunParam,
  type KtType,
  ktFunParam,
  ktRef,
} from "../../kt-dsl/index.js";
import type { TypeCtx } from "../type/index.js";
import { buildBodyParams } from "./body.js";
import { buildNonBodyParams } from "./params.js";
import { returnTypeFor } from "./response.js";

export interface OperationSignature {
  name: string;
  ownerName: string;
  params: ReadonlyArray<KtFunParam>;
  returnType: KtType;
  doc: string;
  locatedParams: ReadonlyArray<LocatedParam>;
  op: IR.OperationObject;
  method: HttpMethod;
  pathStr: string;
  securitySchemeNames: ReadonlyArray<string>;
  responseCases: ReadonlyArray<ResponseCase>;
}

/**
 * One arm of a multi-2xx sum-type return. Populated by `returnTypeFor`
 * when an op declares more than one 2xx response code; the impl
 * dispatches on `response.code` to decode the matching payload type
 * into the matching sealed-subclass. `payloadType` is `undefined` for
 * empty bodies (e.g. 204).
 */
export interface ResponseCase {
  statusCode: string;
  caseName: string;
  payloadType?: KtType;
}

/**
 * One source of truth for `params + returnType + doc` so the interface
 * declaration and the impl class share the same signature shape.
 */
export function operationSignature(
  op: IR.OperationObject,
  method: HttpMethod,
  pathStr: string,
  emit: TypeCtx["emit"],
  schemeNames: ReadonlyArray<string> = [],
): OperationSignature {
  const name = deriveBaseName(op, method, pathStr);
  const ownerName = pascal(name);
  const ctx: TypeCtx = { emit, ownerName, propPath: [] };

  const { params: nonBody, located } = buildNonBodyParams(op, ctx);
  const bodyParams = op.body ? buildBodyParams(op.body, ctx) : [];
  const params = [...nonBody, ...bodyParams, optionsParam()];
  const { type: returnType, cases: responseCases } = returnTypeFor(op, {
    ...ctx,
    propPath: ["response"],
  });

  return {
    name: camel(name),
    ownerName,
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

/**
 * The trailing `options: RequestOptions` param every emitted method
 * takes. Mirrors hey-api's TS SDK per-call options pattern — caller
 * can override `client`, `baseUrl`, `headers`, or pass extra
 * `requestInterceptors` for one call.
 *
 * No default value: Kotlin forbids defaults on `override` methods, so
 * the impl class can't carry one. Callers who don't need overrides
 * reach for the no-options convenience overload emitted alongside as a
 * top-level extension fun.
 */
function optionsParam(): KtFunParam {
  return ktFunParam({
    name: "options",
    type: ktRef("RequestOptions"),
  });
}
