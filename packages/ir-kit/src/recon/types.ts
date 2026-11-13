import type { JSONSchemaDraft2020_12 } from "@hey-api/spec-types";

/** A JSON Schema 2020-12 document — alias for the namespace's `Document` type. */
export type Schema = JSONSchemaDraft2020_12.Document;

/** Lowercase HTTP method. */
export type HttpMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

/** A single captured request/response pair, normalized for inference. */
export interface Sample {
  method: HttpMethod;
  /** Origin (scheme + host + port). e.g. `https://api.example.com` */
  origin: string;
  /** URL pathname only. e.g. `/pets/42` */
  pathname: string;
  /** Query parameters as a flat string→string map. Multi-value keys collapse to last. */
  query: Record<string, string>;
  /** Request headers, lower-cased keys. Sanitized before storage. */
  requestHeaders: Record<string, string>;
  /** Bare media type of the request (e.g. `application/json`), or null. */
  requestContentType: string | null;
  /**
   * Request body: a parsed JSON value when content-type is JSON-like, a
   * string for text-like content, or null for missing/unreadable bodies.
   */
  requestBody: unknown;
  /** Detected auth scheme id from request headers, if any. */
  authSchemeId: string | null;
  /** Response status code. */
  status: number;
  /** Response headers, lower-cased keys. */
  responseHeaders: Record<string, string>;
  /** Bare media type of the response, or null when not provided. */
  responseContentType: string | null;
  /**
   * Response body: a parsed JSON value when content-type is JSON-like, a
   * string for text-like content, or null when missing/binary/unreadable.
   */
  responseBody: unknown;
}

/**
 * Capped, dedup-by-canonical-JSON set of example payloads.
 * Key = canonical JSON string of the value (stable, sorted keys).
 * Value = the parsed example (so emitters don't have to re-parse).
 */
export type ExampleBucket = Map<string, unknown>;

/**
 * Aggregate of all samples for one (status, content-type) tuple.
 * `schema` is `null` for non-JSON content (text/yaml/xml/...) where we
 * carry examples but don't infer a structural schema.
 */
export interface ResponseContent {
  schema: Schema | null;
  examples: ExampleBucket;
}

/** Inferred operation: aggregates samples for one (origin, templated path, method). */
export interface OperationObservation {
  /** Original concrete pathnames seen (for path templating). */
  rawPathnames: Set<string>;
  /** Templated path with `{param}` placeholders; null until templating runs. */
  templatedPath: string | null;
  /** Inferred path-parameter names → primitive type. */
  pathParams: Record<string, "string" | "integer">;
  /**
   * Per-content-type aggregate request body. Each entry carries a schema
   * (JSON only) and bounded examples.
   */
  requestContent: Map<string, ResponseContent>;
  /**
   * Per-status-code, per-content-type aggregate response. A status with no
   * body still gets an entry (empty inner map) so the emitted spec shows
   * the real status code instead of falling through to `default`.
   */
  responseContent: Map<number, Map<string, ResponseContent>>;
  /** Query-parameter names → primitive type. */
  queryParams: Record<string, "string" | "integer" | "boolean">;
  /** Number of samples folded into this observation. */
  sampleCount: number;
  /** Auth scheme ids observed across samples (e.g. `bearerAuth`). */
  authSchemes: Set<string>;
}

/** Configuration for `createRecon`. */
export interface ReconConfig {
  /** Header names to redact entirely (lower-case). Defaults include common auth headers. */
  redactHeaders?: ReadonlyArray<string>;
  /** When true, attempt path templating; when false, every distinct path is its own operation. */
  pathTemplating?: boolean;
  /** OpenAPI document title to emit. @default "Reverse-engineered API" */
  title?: string;
  /** OpenAPI document version to emit. @default "0.0.0" */
  version?: string;
  /**
   * Maximum number of distinct example payloads kept per request body and
   * per response status code. Distinct = different canonical JSON. Set to
   * `0` to disable example capture entirely. @default 3
   */
  maxExamples?: number;
  /**
   * Hoist repeated/recursive object shapes into `components.schemas` and
   * replace inline occurrences with `$ref`. Minimum number of occurrences
   * before a shape is hoisted. Set to `0` to disable. @default 2
   */
  refDedupeThreshold?: number;
}
