/**
 * AUTO-GENERATED — do not edit.
 * Regenerate via `pnpm sync-tags` after bumping typia.
 *
 * Source: @typia/interface v15.4.0
 */

export const TYPIA_TAGS = [
  "Constant",
  "ContentMediaType",
  "Default",
  "Example",
  "Examples",
  "Exclude",
  "ExclusiveMaximum",
  "ExclusiveMinimum",
  "Format",
  "JsonSchemaPlugin",
  "MaxItems",
  "MaxLength",
  "Maximum",
  "MinItems",
  "MinLength",
  "Minimum",
  "MultipleOf",
  "Pattern",
  "Probability",
  "Sequence",
  "TagBase",
  "Type",
  "UniqueItems",
] as const;

export const TYPIA_TAG_META = {
  Constant: { kind: null, targets: [] as const },
  ContentMediaType: { kind: "contentMediaType", targets: ["string"] as const },
  Default: {
    kind: "default",
    targets: ["array", "boolean", "bigint", "number", "string"] as const,
  },
  Example: {
    kind: "example",
    targets: [
      "boolean",
      "bigint",
      "number",
      "string",
      "array",
      "object",
    ] as const,
  },
  Examples: {
    kind: "examples",
    targets: [
      "boolean",
      "bigint",
      "number",
      "string",
      "array",
      "object",
    ] as const,
  },
  Exclude: {
    kind: "exclude",
    targets: ["bigint", "number", "string"] as const,
  },
  ExclusiveMaximum: {
    kind: "exclusiveMaximum",
    targets: ["bigint", "number"] as const,
  },
  ExclusiveMinimum: {
    kind: "exclusiveMinimum",
    targets: ["bigint", "number"] as const,
  },
  Format: { kind: "format", targets: ["string"] as const },
  JsonSchemaPlugin: {
    kind: "jsonPlugin",
    targets: [
      "string",
      "boolean",
      "bigint",
      "number",
      "array",
      "object",
    ] as const,
  },
  MaxItems: { kind: "maxItems", targets: ["array"] as const },
  MaxLength: { kind: "maxLength", targets: ["string"] as const },
  Maximum: { kind: "maximum", targets: ["bigint", "number"] as const },
  MinItems: { kind: "minItems", targets: ["array"] as const },
  MinLength: { kind: "minLength", targets: ["string"] as const },
  Minimum: { kind: "minimum", targets: ["bigint", "number"] as const },
  MultipleOf: { kind: "multipleOf", targets: ["bigint", "number"] as const },
  Pattern: { kind: "pattern", targets: ["string"] as const },
  Probability: {
    kind: "probability",
    targets: ["boolean", "string", "number"] as const,
  },
  Sequence: {
    kind: "sequence",
    targets: [
      "boolean",
      "bigint",
      "number",
      "string",
      "array",
      "object",
    ] as const,
  },
  TagBase: { kind: null, targets: [] as const },
  Type: { kind: "type", targets: ["bigint", "number"] as const },
  UniqueItems: { kind: "uniqueItems", targets: ["array"] as const },
} as const;

export const TYPIA_FORMAT_VALUES = [
  "byte",
  "password",
  "regex",
  "uuid",
  "email",
  "hostname",
  "idn-email",
  "idn-hostname",
  "iri",
  "iri-reference",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "uri-template",
  "url",
  "date-time",
  "date",
  "time",
  "duration",
  "json-pointer",
  "relative-json-pointer",
] as const;

export const TYPIA_INTEGER_FORMATS = [
  "int8",
  "uint8",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "int64",
  "uint64",
  "float",
  "double",
] as const;

export type TypiaTagName = (typeof TYPIA_TAGS)[number];
export type TypiaFormatValue = (typeof TYPIA_FORMAT_VALUES)[number];
export type TypiaIntegerFormat = (typeof TYPIA_INTEGER_FORMATS)[number];
