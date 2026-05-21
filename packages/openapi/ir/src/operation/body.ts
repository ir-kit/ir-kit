import type { IR } from "@hey-api/shared";
import { type Schema } from "@ir-kit/schema";
import { fromHeyApi } from "@ir-kit/schema/adapters/heyapi";

import {
  FORM_URLENCODED_MEDIA,
  JSON_MEDIA_RE,
  MULTIPART_FORM_MEDIA,
} from "../spec/constants.js";

/**
 * `true` when a JSON-typed body has no concrete `type` but carries
 * `oneOf`/`anyOf` branches — there's no cleanly-typed structure to
 * bind to, so each emitter falls back to a raw byte buffer (`[]byte` /
 * `ByteArray` / `Data`).
 */
export function isOpaqueJsonBody(schema: Schema): boolean {
  if (schema.type) return false;
  return Boolean(schema.oneOf?.length || schema.anyOf?.length);
}

/**
 * Outcome of inspecting a body's media type + schema shape. Each
 * emitter switches on `kind` to pick its body-param strategy.
 */
export type BodyShape =
  | { kind: "json-typed" }
  | { kind: "json-opaque" }
  | { kind: "multipart-object" }
  | { kind: "form-urlencoded-object" }
  | { kind: "opaque" };

export interface ClassifiedBody {
  shape: BodyShape;
  /** The body's schema in canonical form, ready to feed `schemaToType`
   *  or `iterateObjectProperties`. */
  schema: Schema;
}

/**
 * Classify a body by media type + schema shape and return the schema
 * pre-converted to canonical form so each emitter can dispatch on
 * `shape.kind` without re-converting.
 */
export function classifyBody(body: IR.BodyObject): ClassifiedBody {
  const mt = (body.mediaType ?? "").toLowerCase();
  const schema = fromHeyApi(body.schema);
  const isObject = schema.type === "object" && Boolean(schema.properties);

  let shape: BodyShape;
  if (mt && JSON_MEDIA_RE.test(mt)) {
    shape = isOpaqueJsonBody(schema)
      ? { kind: "json-opaque" }
      : { kind: "json-typed" };
  } else if (mt.startsWith(MULTIPART_FORM_MEDIA) && isObject) {
    shape = { kind: "multipart-object" };
  } else if (mt.startsWith(FORM_URLENCODED_MEDIA) && isObject) {
    shape = { kind: "form-urlencoded-object" };
  } else {
    shape = { kind: "opaque" };
  }
  return { shape, schema };
}
