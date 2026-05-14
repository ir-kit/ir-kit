import { canonicalJSON } from "./infer/canonical.js";
import { inferSchema, mergeSchema } from "./infer/schema.js";
import type {
  ExampleBucket,
  OperationObservation,
  ResponseContent,
  Sample,
} from "./types.js";

const JSON_CT_RE = /^application\/(.*\+)?json$/i;
const FALLBACK_CT = "application/octet-stream";

/** Group key for aggregation by (origin, method) — within an origin we'll later template paths together. */
function groupKey(origin: string, method: string): string {
  return `${origin}|${method}`;
}

/**
 * In-memory observation store. Keeps:
 *   - `groups`: origin+method → set of raw pathnames + folded body schemas
 *   - One observation per (origin, templated path, method) is materialized
 *     during `flush()` (templating happens lazily so multiple samples share
 *     the same template).
 */
export class Store {
  constructor(private readonly maxExamples: number = 3) {}

  /** group key → folded observation working state */
  private readonly groups = new Map<
    string,
    {
      origin: string;
      method: string;
      observations: Map<string, OperationObservation>;
    }
  >();

  add(sample: Sample): void {
    const k = groupKey(sample.origin, sample.method);
    let group = this.groups.get(k);
    if (!group) {
      group = {
        origin: sample.origin,
        method: sample.method,
        observations: new Map(),
      };
      this.groups.set(k, group);
    }

    // Per-raw-path observation aggregates schemas; templating combines them later.
    let obs = group.observations.get(sample.pathname);
    if (!obs) {
      obs = {
        rawPathnames: new Set(),
        templatedPath: null,
        pathParams: {},
        requestContent: new Map(),
        responseContent: new Map(),
        queryParams: inferQueryParamTypes(sample.query),
        sampleCount: 0,
        authSchemes: new Set(),
      };
      group.observations.set(sample.pathname, obs);
    }
    obs.rawPathnames.add(sample.pathname);
    obs.sampleCount += 1;
    if (sample.authSchemeId) obs.authSchemes.add(sample.authSchemeId);

    if (sample.requestContentType) {
      const slot = ensureContent(obs.requestContent, sample.requestContentType);
      foldBody(
        slot,
        sample.requestContentType,
        sample.requestBody,
        this.maxExamples,
      );
    }

    // Always record the status, even when the body is null (cached/binary/
    // unreadable). That way the spec surfaces the real status code instead
    // of collapsing to `default`.
    let byCt = obs.responseContent.get(sample.status);
    if (!byCt) {
      byCt = new Map();
      obs.responseContent.set(sample.status, byCt);
    }
    if (sample.responseContentType || sample.responseBody != null) {
      const ct = sample.responseContentType ?? FALLBACK_CT;
      const slot = ensureContent(byCt, ct);
      foldBody(slot, ct, sample.responseBody, this.maxExamples);
    }

    // Widen query param types if a new value disagrees.
    for (const [k2, v] of Object.entries(sample.query)) {
      const t = primitiveType(v);
      const existing = obs.queryParams[k2];
      if (!existing) {
        obs.queryParams[k2] = t;
      } else if (existing !== t) {
        obs.queryParams[k2] = "string";
      }
    }
  }

  /** Snapshot of current groups — for the assembler to read. */
  snapshot(): ReadonlyMap<
    string,
    {
      origin: string;
      method: string;
      observations: ReadonlyMap<string, OperationObservation>;
    }
  > {
    return this.groups;
  }

  clear(): void {
    this.groups.clear();
  }

  clearOrigin(origin: string): void {
    for (const [k, g] of this.groups) {
      if (g.origin === origin) this.groups.delete(k);
    }
  }

  /** Total raw observations across all groups (for diagnostics / UI counters). */
  size(): number {
    let n = 0;
    for (const g of this.groups.values()) {
      for (const o of g.observations.values()) n += o.sampleCount;
    }
    return n;
  }

  /** Per-origin sample counts. Sorted by origin for stable UI. */
  originStats(): Map<string, number> {
    const out = new Map<string, number>();
    for (const g of this.groups.values()) {
      let n = 0;
      for (const o of g.observations.values()) n += o.sampleCount;
      out.set(g.origin, (out.get(g.origin) ?? 0) + n);
    }
    return new Map([...out].sort(([a], [b]) => a.localeCompare(b)));
  }
}

function inferQueryParamTypes(
  q: Record<string, string>,
): Record<string, "string" | "integer" | "boolean"> {
  const out: Record<string, "string" | "integer" | "boolean"> = {};
  for (const [k, v] of Object.entries(q)) out[k] = primitiveType(v);
  return out;
}

function primitiveType(v: string): "string" | "integer" | "boolean" {
  if (v === "true" || v === "false") return "boolean";
  if (/^-?\d+$/.test(v)) return "integer";
  return "string";
}

function ensureContent(
  map: Map<string, ResponseContent>,
  contentType: string,
): ResponseContent {
  let slot = map.get(contentType);
  if (!slot) {
    slot = { schema: null, examples: new Map() };
    map.set(contentType, slot);
  }
  return slot;
}

/**
 * Fold a body sample into a `ResponseContent` slot. JSON bodies contribute
 * to schema inference + structured examples; text bodies contribute string
 * examples only (no schema). Null bodies are recorded as "seen this status
 * and content-type" without an example.
 */
function foldBody(
  slot: ResponseContent,
  contentType: string,
  body: unknown,
  cap: number,
): void {
  if (body == null) return;
  if (JSON_CT_RE.test(contentType) && typeof body === "object") {
    const inferred = inferSchema(body);
    slot.schema = slot.schema ? mergeSchema(slot.schema, inferred) : inferred;
    addExample(slot.examples, body, cap);
    return;
  }
  if (typeof body === "string") {
    addExample(slot.examples, body, cap);
  }
}

/** Insert into a capped example bucket. Dedup by canonical JSON. */
function addExample(bucket: ExampleBucket, value: unknown, cap: number): void {
  if (cap <= 0) return;
  if (bucket.size >= cap) return;
  const key = canonicalJSON(value);
  if (bucket.has(key)) return;
  bucket.set(key, value);
}
