import {
  avoidLeadingDigit,
  escapeIfReserved,
  Namespace,
  softCamel,
  typeIdent,
} from "@ir-kit/codegen-core";

/**
 * Swift-specific identifier transforms. Generic case helpers
 * (`pascal`, `camel`, `safeIdent`, `safeCaseName`, `synthName`,
 * `softCamel`, `escapeIfReserved`, `avoidLeadingDigit`) live in
 * `@ir-kit/codegen-core`. The export here covers what's unique to
 * Swift: backtick-escaping for the reserved-keyword set.
 */
export function paramIdent(name: string): string {
  const ident = softCamel(name).replace(/[^A-Za-z0-9_]/g, "") || "value";
  return escapeIfReserved(
    avoidLeadingDigit(ident),
    SWIFT_RESERVED_KEYWORDS,
    (s) => `\`${s}\``,
  );
}

/**
 * Swift reserved keywords from the Language Guide's Lexical Structure
 * (declaration / statement / expression-and-type / pattern / context-
 * sensitive). Used by `paramIdent` to escape collisions in backticks.
 */
const SWIFT_RESERVED_KEYWORDS: ReadonlySet<string> = new Set([
  // declaration
  "associatedtype",
  "class",
  "deinit",
  "enum",
  "extension",
  "fileprivate",
  "func",
  "import",
  "init",
  "inout",
  "internal",
  "let",
  "open",
  "operator",
  "precedencegroup",
  "private",
  "protocol",
  "public",
  "rethrows",
  "static",
  "struct",
  "subscript",
  "typealias",
  "var",
  // statement
  "break",
  "case",
  "catch",
  "continue",
  "default",
  "defer",
  "do",
  "else",
  "fallthrough",
  "for",
  "guard",
  "if",
  "in",
  "repeat",
  "return",
  "switch",
  "throw",
  "where",
  "while",
  // expression / type
  "Any",
  "as",
  "await",
  "false",
  "is",
  "nil",
  "self",
  "Self",
  "super",
  "throws",
  "true",
  "try",
  // pattern
  "_",
  // context-sensitive
  "associativity",
  "convenience",
  "didSet",
  "dynamic",
  "final",
  "get",
  "indirect",
  "infix",
  "lazy",
  "left",
  "mutating",
  "none",
  "nonmutating",
  "optional",
  "override",
  "postfix",
  "precedence",
  "prefix",
  "Protocol",
  "required",
  "right",
  "set",
  "some",
  "Type",
  "unowned",
  "weak",
  "willSet",
]);

/** `typeIdent` joined into the UpperCamelCase form Swift type names use. */
export function swiftTypeIdent(name: string): string {
  const joined = typeIdent(name)
    .replace(/_+([A-Za-z0-9])/g, (_, c: string) => c.toUpperCase())
    .replace(/_/g, "");
  const pascal = joined.replace(/^./, (c) => c.toUpperCase());
  return /^[0-9]/.test(pascal) ? `X${pascal}` : pascal || "Empty";
}

/** Owns every top-level Swift type name for one generation run. */
export function newTypeNames(): Namespace {
  return new Namespace({ normalize: swiftTypeIdent });
}
