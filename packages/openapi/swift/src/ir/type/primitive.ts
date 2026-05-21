import type { Schema } from "@ir-kit/openapi";

import type { SwType } from "../../sw-dsl/index.js";
import {
  swBool,
  swData,
  swDouble,
  swFloat,
  swInt,
  swInt32,
  swInt64,
  swRef,
  swString,
} from "../../sw-dsl/index.js";

/**
 * OpenAPI string `format` → Swift Foundation type. Unknown formats
 * fall back to `String`. `date-time` / `date` both map to `Date`
 * (consumer configures `JSONDecoder.dateDecodingStrategy`).
 */
function typeForStringFormat(format: string | undefined): SwType {
  switch (format) {
    case "date-time":
    case "date":
      return swRef("Date");
    case "uuid":
      return swRef("UUID");
    case "uri":
    case "url":
      return swRef("URL");
    case "binary":
    case "byte":
      return swData;
    default:
      return swString;
  }
}

export function typeForPrimitive(s: Schema): SwType | undefined {
  const t = Array.isArray(s.type)
    ? s.type.find((x: string) => x !== "null")
    : s.type;
  switch (t) {
    case "string":
      return typeForStringFormat(s.format);
    case "integer":
      if (s.format === "int64") return swInt64;
      if (s.format === "int32") return swInt32;
      return swInt;
    case "number":
      return s.format === "float" ? swFloat : swDouble;
    case "boolean":
      return swBool;
    default:
      return undefined;
  }
}
