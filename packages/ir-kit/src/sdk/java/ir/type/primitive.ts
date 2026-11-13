import type { Schema } from "../../../../openapi/index.js";

import {
  type JType,
  jBoolean,
  jBytes,
  jDouble,
  jFloat,
  jInteger,
  jLong,
  jRef,
  jString,
} from "../../ast/index.js";

function typeForStringFormat(format: string | undefined): JType {
  switch (format) {
    case "date-time":
      return jRef("OffsetDateTime");
    case "date":
      return jRef("LocalDate");
    case "binary":
    case "byte":
      return jBytes;
    default:
      return jString;
  }
}

export function typeForPrimitive(s: Schema): JType | undefined {
  const t = Array.isArray(s.type)
    ? s.type.find((x: string) => x !== "null")
    : s.type;
  switch (t) {
    case "string":
      return typeForStringFormat(s.format);
    case "integer":
      return s.format === "int64" ? jLong : jInteger;
    case "number":
      return s.format === "float" ? jFloat : jDouble;
    case "boolean":
      return jBoolean;
    default:
      return undefined;
  }
}
