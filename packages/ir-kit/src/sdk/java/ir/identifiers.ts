import {
  avoidLeadingDigit,
  escapeIfReserved,
  Namespace,
  softCamel,
  typeIdent,
} from "../../../codegen/index.js";

export function paramIdent(name: string): string {
  const ident = softCamel(name).replace(/[^A-Za-z0-9_$]/g, "") || "value";
  return escapeIfReserved(
    avoidLeadingDigit(ident),
    JAVA_RESERVED,
    (s) => `${s}_`,
  );
}

/** Locals declared by generated method bodies; parameters must not shadow them. */
const OPERATION_LOCALS: ReadonlySet<string> = new Set([
  "auth",
  "baseUri",
  "builder",
  "client",
  "form",
  "header",
  "multipart",
  "options",
  "query",
  "scheme",
  "url",
]);

export function operationParamIdent(name: string): string {
  return escapeIfReserved(
    paramIdent(name),
    OPERATION_LOCALS,
    (s) => `${s}Param`,
  );
}

/** `java.lang.Object` methods a record accessor would illegally override. */
const OBJECT_METHODS: ReadonlySet<string> = new Set([
  "clone",
  "equals",
  "finalize",
  "getClass",
  "hashCode",
  "notify",
  "notifyAll",
  "toString",
  "wait",
]);

export function componentIdent(name: string): string {
  return escapeIfReserved(paramIdent(name), OBJECT_METHODS, (s) => `${s}_`);
}

/** PascalCase type name: `funding_instructions` → `FundingInstructions`. */
export function javaTypeIdent(name: string): string {
  const ident = typeIdent(name);
  const joined = ident
    .replace(/_+([A-Za-z0-9])/g, (_, c: string) => c.toUpperCase())
    .replace(/_/g, "");
  const pascal = joined.replace(/^./, (c) => c.toUpperCase());
  return /^[0-9]/.test(pascal) ? `X${pascal}` : pascal || "Empty";
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
  return new Namespace({ normalize: javaTypeIdent });
}
