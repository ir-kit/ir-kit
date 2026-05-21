export type { BodyShape } from "./operation/body.js";
export { classifyBody, isOpaqueJsonBody } from "./operation/body.js";
export type { IteratedOperation } from "./operation/iter.js";
export { iterOperations } from "./operation/iter.js";
export type { LocatedParam, ParamLocation } from "./operation/params.js";
export {
  collectLocatedParams,
  PARAM_LOCATIONS,
  paramsAt,
} from "./operation/params.js";
export type { ResponseCase, ReturnShape } from "./operation/responses.js";
export {
  classifyReturnShape,
  isSuccessStatus,
  successResponses,
} from "./operation/responses.js";
export {
  deriveBaseName,
  operationDocLine,
  splitPathSegments,
} from "./operation/signature.js";
export type { TemplatePart } from "./operation/template.js";
export { parseTemplatedSegment } from "./operation/template.js";
export {
  FORM_URLENCODED_MEDIA,
  HTTP_METHOD_LITERAL,
  HTTP_METHODS,
  type HttpMethod,
  JSON_MEDIA_RE,
  MULTIPART_FORM_MEDIA,
} from "./spec/constants.js";
export type {
  Casing,
  EnumPassOptions,
  NamingConfig,
  NamingRule,
  NormalizeOptions,
  ObjectPassOptions,
} from "./spec/normalize/index.js";
export { normalizeSpec, SAFE_NORMALIZE } from "./spec/normalize/index.js";
export { isMeaningless, refName } from "./spec/ref.js";
export { extractSecuritySchemeNames, securityKey } from "./spec/security.js";

export type { TypeCtx } from "./type/context.js";
export type { SchemaToTypeOps } from "./type/dispatch.js";
export { schemaToType } from "./type/dispatch.js";
export type { EnumEntryIdent, EnumKind, EnumLiteral } from "./type/enum.js";
export {
  assertNoEnumCollisions,
  classifyEnumLiterals,
} from "./type/enum.js";
export type { ObjectProperty, ObjectShape } from "./type/object.js";
export {
  classifyObjectShape,
  iterateObjectProperties,
} from "./type/object.js";
export type { UnionShape } from "./type/union.js";
export { classifyUnion } from "./type/union.js";
