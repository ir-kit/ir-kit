export {
  type DiffOptions,
  type DiffReport,
  diffSpecs,
  type EndpointDiff,
  type RequiredChange,
  type ShapeDiff,
  type TypeChange,
} from "./diff.js";
export { routesFromIR } from "./ir.js";
export {
  type LoadSpecOptions,
  loadSpec,
  resolveSpecInput,
  type SpecInput,
} from "./load.js";
export {
  type ExtractParams,
  isInSpec,
  type MatchResult,
  match,
} from "./match.js";
export type { IR } from "./parse.js";
export { parseSpec } from "./parse.js";
export type { Route } from "./route.js";
export { createRouter, type Router } from "./router.js";
export {
  type EnumLiteral,
  getEnumLiterals,
  isEnumSchema,
  isUnionSchema,
} from "./schema.js";
