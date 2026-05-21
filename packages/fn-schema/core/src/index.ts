export { resolveSchemaOptions, resolveSignatureOptions } from "./defaults.js";
export { DiagnosticSink, FailFastError } from "./diagnostics.js";
export * as emit from "./emit/index.js";
export { applyFilter, resolveFilter } from "./filter.js";
export { resolveNaming } from "./naming.js";
export {
  type FnSchemaConfig,
  loadFnSchemaConfig,
} from "./orchestrators/config.js";
export {
  type DiffChange,
  type DiffDefinitionChange,
  type RunDiffResult,
  runDiff,
} from "./orchestrators/diff.js";
export {
  type Dialect,
  type Naming,
  type Params,
  type RunExtractOptions,
  type RunExtractResult,
  runExtract,
} from "./orchestrators/extract.js";
export {
  baseExtractOpts,
  collectPatterns,
  makeListFiles,
  mergeExclude,
  mergeInclude,
  resolveCwd,
} from "./orchestrators/helpers.js";
export {
  type RunInspectOptions,
  type RunInspectResult,
  runInspect,
} from "./orchestrators/inspect.js";
export {
  type RunScanOptions,
  type RunScanResult,
  runScan,
} from "./orchestrators/scan.js";
export { createProject } from "./project.js";
export { type ParsedTarget, parseTarget } from "./targets.js";
export type {
  CoverageEntry,
  CoverageOccurrence,
  CoverageReport,
  Diagnostic,
  DiagnosticCode,
  DiagnosticSeverity,
  DiscoverResult,
  ExcludeFilter,
  ExtractHooks,
  ExtractOptions,
  Extractor,
  ExtractorInitOptions,
  ExtractorInstance,
  ExtractResult,
  ExtractStats,
  FunctionInfo,
  FunctionKind,
  GenericsStrategy,
  IncludeFilter,
  InMemorySource,
  JSDocInfo,
  JSONSchema,
  LossyCoverageEntry,
  NamePattern,
  NamingStrategy,
  OverloadStrategy,
  ParameterInfo,
  ParametersStrategy,
  Project,
  ProjectOptions,
  RefStrategy,
  ResolvedFilter,
  ResolvedSchemaOptions,
  ResolvedSignatureOptions,
  SchemaContext,
  SchemaDialect,
  SchemaOptions,
  SignatureEntry,
  SignatureOptions,
  SignaturePair,
  SourceLocation,
  TargetRef,
} from "./types.js";
