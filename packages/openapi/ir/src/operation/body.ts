import type { IR } from "@hey-api/shared";
import {
  FORM_URLENCODED_MEDIA,
  JSON_MEDIA_RE,
  MULTIPART_FORM_MEDIA,
} from "../spec/constants.js";

/**
 * `true` when a JSON-typed body has no concrete `type` but carries an
 * `items[]` (typical of bare `oneOf`/`anyOf` schemas) — there's no
 * cleanly-typed structure to bind to, so each emitter falls back to a
 * raw byte buffer (`[]byte` / `ByteArray` / `Data`).
 */
export function isOpaqueJsonBody(schema: IR.SchemaObject): boolean {
  return !schema.type && Array.isArray(schema.items) && schema.items.length > 0;
}

/**
 * Outcome of inspecting `IR.BodyObject`'s media type + schema shape.
 * Each emitter switches on `kind` to pick its body-param strategy.
 */
export type BodyShape =
  /** `application/json` with a meaningful schema. */
  | { kind: "json-typed" }
  /** `application/json` whose schema collapses to opaque (oneOf/anyOf
   *  without a single shared shape). Each emitter falls back to bytes. */
  | { kind: "json-opaque" }
  /** `multipart/form-data` whose schema is an object — flatten props
   *  into one func param each. */
  | { kind: "multipart-object" }
  /** `application/x-www-form-urlencoded` whose schema is an object —
   *  flatten props into one func param each. */
  | { kind: "form-urlencoded-object" }
  /** Empty / octet-stream / image/* / unknown — caller pre-encodes a
   *  single bytes param. */
  | { kind: "opaque" };

/**
 * Classify a body by its media type + schema shape so emitters can
 * dispatch identically on `kind`. The media-type matching rules use
 * the shared constants in `../spec/constants` — single source of truth.
 */
export function classifyBody(body: IR.BodyObject): BodyShape {
  const mt = (body.mediaType ?? "").toLowerCase();
  const schema = body.schema;
  const isObject = schema.type === "object" && Boolean(schema.properties);

  if (mt && JSON_MEDIA_RE.test(mt)) {
    return isOpaqueJsonBody(schema)
      ? { kind: "json-opaque" }
      : { kind: "json-typed" };
  }
  if (mt.startsWith(MULTIPART_FORM_MEDIA) && isObject) {
    return { kind: "multipart-object" };
  }
  if (mt.startsWith(FORM_URLENCODED_MEDIA) && isObject) {
    return { kind: "form-urlencoded-object" };
  }
  return { kind: "opaque" };
}
