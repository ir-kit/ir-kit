import type { OpenAPIV3_1 } from "@hey-api/spec-types";

import { canonicalJSON } from "../infer/canonical";
import type { Schema } from "../types";

const REF_PREFIX = "#/components/schemas/";

/**
 * Object shapes worth hoisting are at least this complex. Shapes with one
 * or zero properties give little benefit and produce noisy component names.
 */
const MIN_PROPERTIES = 2;

interface SchemaLike {
  type?: unknown;
  properties?: Record<string, unknown>;
  items?: unknown;
  $ref?: string;
  required?: unknown;
}

const MAX_DEDUPE_PASSES = 5;

/**
 * Walk a paths object, hoist any object-shape that appears at least
 * `threshold` times into `components.schemas`, and rewrite occurrences
 * with a `$ref`. Operates in-place on `paths`. Returns the accumulated
 * component entries.
 *
 * Runs up to `MAX_DEDUPE_PASSES` rounds. After each pass, the rewritten
 * paths contain `$ref`s where deep shapes used to be. An outer shape that
 * wrapped two distinct deep shapes in pass 1 may become structurally
 * identical to another outer shape once both inner shapes are replaced —
 * iterating catches that cascade.
 */
export function dedupeSchemas(
  paths: Record<string, unknown>,
  threshold: number,
): Record<string, OpenAPIV3_1.SchemaObject> {
  if (threshold <= 1) return {};

  const accumulated: Record<string, OpenAPIV3_1.SchemaObject> = {};
  const taken = new Set<string>();

  for (let pass = 0; pass < MAX_DEDUPE_PASSES; pass++) {
    const added = dedupePass(paths, accumulated, taken, threshold);
    if (!added) break;
  }
  return accumulated;
}

/** A single dedupe pass — returns true if any new component was hoisted. */
function dedupePass(
  paths: Record<string, unknown>,
  accumulated: Record<string, OpenAPIV3_1.SchemaObject>,
  taken: Set<string>,
  threshold: number,
): boolean {
  const counts = new Map<string, { count: number; sample: Schema }>();
  const visit = (schema: Schema) => {
    if (!isHoistable(schema)) return;
    const key = canonicalJSON(schema);
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { count: 1, sample: schema });
  };
  forEachSchemaIn(paths, visit);
  for (const entry of Object.values(accumulated)) {
    walkSchema(entry as Schema, visit);
  }

  const qualifying = [...counts.entries()]
    .filter(([, v]) => v.count >= threshold)
    .sort(([a], [b]) => a.length - b.length);
  if (qualifying.length === 0) return false;

  const hashToName = new Map<string, string>();
  for (const [hash, { sample }] of qualifying) {
    const name = uniqueName(deriveName(sample), taken);
    taken.add(name);
    hashToName.set(hash, name);
  }

  for (const [hash, { sample }] of qualifying) {
    const name = hashToName.get(hash);
    if (!name) continue;
    accumulated[name] = rewrite(
      sample,
      hashToName,
      hash,
    ) as OpenAPIV3_1.SchemaObject;
  }

  rewriteIn(paths, hashToName);
  for (const [name, entry] of Object.entries(accumulated)) {
    accumulated[name] = rewrite(
      entry as Schema,
      hashToName,
      canonicalJSON(entry as Schema),
    ) as OpenAPIV3_1.SchemaObject;
  }
  return true;
}

/**
 * Keys whose values are opaque data, not OpenAPI structures — never descend
 * into them while looking for `schema` keys. Critical when an `example`
 * happens to itself be an OpenAPI document (e.g. an API that serves OpenAPI
 * specs): without this skip, the walker would treat `example.paths.foo.get.
 * responses.200.content.application/json.schema` as a real schema, hoist it,
 * and rewrite the example into a broken `$ref` salad.
 */
const OPAQUE_KEYS = new Set(["example", "examples"]);

function forEachSchemaIn(node: unknown, visit: (schema: Schema) => void): void {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) forEachSchemaIn(item, visit);
    return;
  }
  const obj = node as Record<string, unknown>;
  if ("schema" in obj && obj.schema && typeof obj.schema === "object") {
    walkSchema(obj.schema as Schema, visit);
  }
  for (const [k, v] of Object.entries(obj)) {
    if (OPAQUE_KEYS.has(k)) continue;
    forEachSchemaIn(v, visit);
  }
}

function walkSchema(schema: Schema, visit: (s: Schema) => void): void {
  visit(schema);
  const s = schema as SchemaLike;
  if (s.properties) {
    for (const v of Object.values(s.properties)) {
      if (v && typeof v === "object") walkSchema(v as Schema, visit);
    }
  }
  if (s.items && typeof s.items === "object") {
    walkSchema(s.items as Schema, visit);
  }
}

function isHoistable(schema: Schema): boolean {
  const s = schema as SchemaLike;
  if (s.$ref) return false;
  if (s.type !== "object") return false;
  const props = s.properties;
  if (!props || typeof props !== "object") return false;
  return Object.keys(props).length >= MIN_PROPERTIES;
}

function rewrite(
  schema: Schema,
  hashToName: Map<string, string>,
  selfHash: string | null,
): Schema {
  const s = schema as SchemaLike;
  if (s.$ref) return schema;

  const ownHash = isHoistable(schema) ? canonicalJSON(schema) : null;
  if (ownHash && ownHash !== selfHash && hashToName.has(ownHash)) {
    return { $ref: `${REF_PREFIX}${hashToName.get(ownHash)}` } as Schema;
  }

  const out: SchemaLike = { ...s };
  if (s.properties) {
    const props: Record<string, Schema> = {};
    for (const [k, v] of Object.entries(s.properties)) {
      props[k] =
        v && typeof v === "object"
          ? rewrite(v as Schema, hashToName, null)
          : (v as Schema);
    }
    out.properties = props;
  }
  if (s.items && typeof s.items === "object") {
    out.items = rewrite(s.items as Schema, hashToName, null);
  }
  return out as Schema;
}

function rewriteIn(node: unknown, hashToName: Map<string, string>): void {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) rewriteIn(item, hashToName);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (
    obj.schema &&
    typeof obj.schema === "object" &&
    !Array.isArray(obj.schema)
  ) {
    obj.schema = rewrite(obj.schema as Schema, hashToName, null);
  }
  for (const [k, v] of Object.entries(obj)) {
    if (OPAQUE_KEYS.has(k)) continue;
    rewriteIn(v, hashToName);
  }
}

/**
 * Derive a Pascal-case component name from an object schema's property
 * names — first two non-trivial keys joined. `{ id, name, email }` →
 * `IdName`. Falls back to `Shape` when nothing usable is present.
 */
function deriveName(schema: Schema): string {
  const s = schema as SchemaLike;
  const keys = Object.keys(s.properties ?? {});
  const picked = keys.slice(0, 2).map(pascalize).filter(Boolean);
  const base = picked.join("") || "Shape";
  return sanitize(base).slice(0, 40);
}

function pascalize(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function sanitize(s: string): string {
  const cleaned = s.replace(/[^a-zA-Z0-9_]/g, "");
  return /^[A-Za-z]/.test(cleaned) ? cleaned : `S${cleaned}`;
}

function uniqueName(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}${i}`;
    if (!taken.has(candidate)) return candidate;
  }
}
