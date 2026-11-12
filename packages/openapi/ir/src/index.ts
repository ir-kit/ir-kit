export type {
  EnumEntryIdent,
  EnumKind,
  EnumLiteral,
  ObjectProperty,
  ObjectShape,
  Schema,
  SchemaDiscriminator,
  SchemaOrBool,
  SchemaPrimitiveType,
  UnionShape,
} from "@ir-kit/schema";
export {
  classifyEnumLiterals,
  classifyObject,
  classifyUnion,
  extractEnumValues,
  isNullable,
  isPrimitive,
  isRefOnly,
  isSchemaObject,
  isUnionShape,
  iterateObjectProperties,
  primitiveTag,
  refName,
  typeList,
  uniqueEnumEntries,
} from "@ir-kit/schema";
export { fromHeyApi } from "@ir-kit/schema/adapters/heyapi";
export type { BodyShape, ClassifiedBody } from "./operation/body.js";
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
export {
  hoistForeignSchemaRefs,
  normalizeSpec,
  SAFE_NORMALIZE,
} from "./spec/normalize/index.js";
export { isMeaningless } from "./spec/ref.js";
export { extractSecuritySchemeNames, securityKey } from "./spec/security.js";
export {
  type Component,
  type ComponentShape,
  classifyComponents,
} from "./type/components.js";
export type { TypeCtx } from "./type/context.js";
export type { SchemaToTypeOps } from "./type/dispatch.js";
export {
  enumType,
  schemaToType,
  schemaTypeName,
  synthTypeName,
} from "./type/dispatch.js";
