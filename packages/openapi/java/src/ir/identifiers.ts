import {
  avoidLeadingDigit,
  escapeIfReserved,
  Namespace,
  softCamel,
  typeIdent,
} from "@ir-kit/codegen-core";

export function paramIdent(name: string): string {
  return escapeIfReserved(
    avoidLeadingDigit(softCamel(name)),
    JAVA_RESERVED,
    (s) => `${s}_`,
  );
}

export function enumEntryIdent(s: string): string {
  const parts = s
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/_+/)
    .filter(Boolean);
  return avoidLeadingDigit(parts.join("_").toUpperCase()) || "EMPTY";
}

export const JAVA_RESERVED: ReadonlySet<string> = new Set([
  "abstract",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extends",
  "false",
  "final",
  "finally",
  "float",
  "for",
  "goto",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "native",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "true",
  "try",
  "var",
  "void",
  "volatile",
  "while",
  "yield",
  "record",
  "sealed",
  "permits",
]);

export function newTypeNames(): Namespace {
  return new Namespace({ normalize: typeIdent });
}
