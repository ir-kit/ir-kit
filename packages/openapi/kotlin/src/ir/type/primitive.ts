import type { Schema } from "@ir-kit/openapi";

import {
  type KtType,
  ktBoolean,
  ktByteArray,
  ktDouble,
  ktFloat,
  ktInt,
  ktLong,
  ktRef,
  ktString,
} from "../../kt-dsl/index.js";

/**
 * OpenAPI string `format` → Kotlin / kotlinx-datetime / `String` type.
 * Unknown formats fall back to `String`.
 *
 *  - `date-time`        → `Instant` (kotlinx-datetime, built-in
 *                        `@Serializable` serializer).
 *  - `date`             → `LocalDate` (kotlinx-datetime, same).
 *  - `uuid` / `uri` / `url` → `String`. kotlinx-serialization has no
 *                        built-in `UUID` / `URL` serializers, so wire
 *                        compat wins over type safety. Consumers who
 *                        want `java.util.UUID` can layer a custom
 *                        `@Contextual` serializer on top of the field.
 *  - `binary` / `byte`  → `ByteArray` (matches multipart field handling).
 */
function typeForStringFormat(format: string | undefined): KtType {
  switch (format) {
    case "date-time":
      return ktRef("Instant");
    case "date":
      return ktRef("LocalDate");
    case "binary":
    case "byte":
      return ktByteArray;
    default:
      return ktString;
  }
}

export function typeForPrimitive(s: Schema): KtType | undefined {
  const t = Array.isArray(s.type)
    ? s.type.find((x: string) => x !== "null")
    : s.type;
  switch (t) {
    case "string":
      return typeForStringFormat(s.format);
    case "integer":
      if (s.format === "int64") return ktLong;
      return ktInt;
    case "number":
      return s.format === "float" ? ktFloat : ktDouble;
    case "boolean":
      return ktBoolean;
    default:
      return undefined;
  }
}
