import type { Namespace } from "../../../../codegen/index.js";
import { camel, pascal } from "../../../../codegen/index.js";
import type { IR } from "../../../../ir/index.js";
import {
  deriveBaseName,
  type HttpMethod,
  type LocatedParam,
  operationDocLine,
} from "../../../../openapi/index.js";

import { type JParam, type JType, jParam, jRef } from "../../ast/index.js";
import type { TypeCtx } from "../type/index.js";
import { buildBodyParams } from "./body.js";
import { buildNonBodyParams } from "./params.js";
import { returnTypeFor } from "./response.js";

export interface OperationSignature {
  name: string;
  ownerName: string;
  /** Every parameter except the trailing `RequestOptions options`. */
  params: ReadonlyArray<JParam>;
  returnType: JType;
  doc: string;
  locatedParams: ReadonlyArray<LocatedParam>;
  op: IR.Operation;
  method: HttpMethod;
  pathStr: string;
  securitySchemeNames: ReadonlyArray<string>;
  responseCases: ReadonlyArray<ResponseCase>;
}

export interface ResponseCase {
  statusCode: string;
  caseName: string;
  payloadType?: JType;
}

export const optionsParam = (): JParam =>
  jParam("options", jRef("RequestOptions"));

export function operationSignature(
  op: IR.Operation,
  method: HttpMethod,
  pathStr: string,
  emit: TypeCtx["emit"],
  names: Namespace,
): OperationSignature {
  const name = deriveBaseName(op, method, pathStr);
  const ownerName = pascal(name);
  const ctx: TypeCtx = { emit, names, ownerName, propPath: [] };
  const { params: nonBody, located } = buildNonBodyParams(op, ctx);
  const bodyParams = op.body ? buildBodyParams(op.body, ctx) : [];
  const { type: returnType, cases: responseCases } = returnTypeFor(op, {
    ...ctx,
    propPath: ["response"],
  });
  return {
    name: camel(name),
    ownerName,
    params: [...nonBody, ...bodyParams],
    returnType,
    doc: operationDocLine(method, pathStr),
    locatedParams: located,
    op,
    method,
    pathStr,
    securitySchemeNames: op.securitySchemes,
    responseCases,
  };
}
