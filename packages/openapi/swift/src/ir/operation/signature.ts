import type { IR } from "@hey-api/shared";
import { camel, pascal } from "@ir-kit/codegen-core";
import {
  deriveBaseName,
  type ResponseCase as IRResponseCase,
  type LocatedParam,
  operationDocLine,
} from "@ir-kit/openapi";
import type { HttpMethod } from "@ir-kit/openapi-core";
import type { SwFunParam, SwType } from "../../sw-dsl/index.js";
import { swFunParam, swRef } from "../../sw-dsl/index.js";
import type { TypeCtx } from "../type/index.js";
import { buildBodyParams } from "./body.js";
import { buildNonBodyParams } from "./params.js";
import { returnTypeFor } from "./response.js";

export interface OperationSignature {
  name: string;
  ownerName: string;
  params: ReadonlyArray<SwFunParam>;
  returnType: SwType;
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
 * dispatches on `httpResponse.statusCode` to decode the matching
 * payload type into the matching enum case. `payloadType` is
 * `undefined` for empty bodies (e.g. 204).
 */
export type ResponseCase = IRResponseCase<SwType>;

/**
 * One source of truth for `params + returnType + doc` so the protocol
 * declaration and the impl class share the same signature shape.
 *
 * `schemeNames` is the per-op security scheme name list pre-extracted
 * by the orchestrator — the IR drops scheme names from `op.security`,
 * so the caller resolves them from the bundled spec and threads them
 * through.
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
 * The trailing `options: RequestOptions = .init()` param every emitted
 * method takes. Mirrors hey-api's TS SDK per-call options pattern —
 * caller can override `client`, `baseURL`, `headers`, or pass extra
 * `requestInterceptors` for one call.
 *
 * The default value is set here for the impl method; the protocol-fun
 * builder strips defaults (Swift forbids them in protocol decls) and a
 * protocol extension provides the no-options convenience overload.
 */
function optionsParam(): SwFunParam {
  return swFunParam({
    name: "options",
    type: swRef("RequestOptions"),
    default: "RequestOptions()",
  });
}
