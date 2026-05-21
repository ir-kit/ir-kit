export type { BodyShape } from "./operation/body.js";
export { classifyBody, isOpaqueJsonBody } from "./operation/body.js";
export type { LocatedParam, ParamLocation } from "./operation/params.js";
export { collectLocatedParams, PARAM_LOCATIONS } from "./operation/params.js";
export { isSuccessStatus, successResponses } from "./operation/responses.js";
export { deriveBaseName, operationDocLine } from "./operation/signature.js";
export type { TypeCtx } from "./type/context.js";
export type { UnionShape } from "./type/union.js";
export { classifyUnion } from "./type/union.js";
