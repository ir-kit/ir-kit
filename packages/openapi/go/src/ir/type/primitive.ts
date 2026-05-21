import type { Schema } from "@ir-kit/openapi";

import {
  type GoType,
  goBool,
  goFloat32,
  goFloat64,
  goInt,
  goInt32,
  goInt64,
  goRef,
  goSlice,
  goString,
} from "../../go-dsl/index.js";

function typeForStringFormat(format: string | undefined): GoType {
  switch (format) {
    case "date-time":
      return goRef("time.Time");
    case "binary":
    case "byte":
      return goSlice(goRef("byte"));
    default:
      return goString;
  }
}

/**
 * Map a primitive canonical {@link Schema} to the matching Go type.
 * Returns `undefined` for non-primitive schemas so the dispatcher can
 * fall through. Date-only (`format: "date"`) stays on `string` since
 * `time.Time` can't unmarshal it.
 */
export function typeForPrimitive(s: Schema): GoType | undefined {
  const t = Array.isArray(s.type)
    ? s.type.find((x: string) => x !== "null")
    : s.type;
  switch (t) {
    case "string":
      return typeForStringFormat(s.format);
    case "integer":
      if (s.format === "int64") return goInt64;
      if (s.format === "int32") return goInt32;
      return goInt;
    case "number":
      return s.format === "float" ? goFloat32 : goFloat64;
    case "boolean":
      return goBool;
    default:
      return undefined;
  }
}
