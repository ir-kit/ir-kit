import {
  avoidLeadingDigit,
  camel,
  escapeIfReserved,
  Namespace,
  safeCaseName,
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
  const ident = avoidLeadingDigit(
    softCamel(name).replace(/[^A-Za-z0-9_]/g, "") || "value",
  );
  return escapeKeyword(OPERATION_LOCALS.has(ident) ? `${ident}Param` : ident);
}

/** Stored-property identifier for a JSON key. */
export function memberIdent(jsonKey: string): string {
  return escapeKeyword(
    unshadowSelf(avoidLeadingDigit(camel(jsonKey) || "value")),
  );
}

/** `self` stays a keyword in member access even when escaped, so it is renamed. */
const unshadowSelf = (name: string): string =>
  name === "self" ? "selfValue" : name;

/** Enum case identifier for a raw value, before keyword escaping. */
export const caseName = (raw: string): string =>
  unshadowSelf(safeCaseName(raw) || "empty");

export const escapeKeyword = (name: string): string =>
  escapeIfReserved(name, SWIFT_RESERVED_KEYWORDS, (s) => `\`${s}\``);

/**
 * Names generated method bodies bind (`let url`, `var request`, …) or
 * declare as parameters (`options`). An operation parameter spelled the
 * same would be shadowed, so it takes a `Param` suffix.
 */
const OPERATION_LOCALS: ReadonlySet<string> = new Set([
  "baseURL",
  "body",
  "client",
  "components",
  "data",
  "formComponents",
  "multipart",
  "options",
  "request",
  "self",
  "timeout",
  "url",
  "urlComponents",
]);

/**
 * Type names the generated module already uses: runtime helpers and the
 * Swift / Foundation types generated code refers to unqualified.
 */
const RESERVED_TYPE_NAMES: ReadonlySet<string> = new Set([
  "APIClient",
  "APIError",
  "APIInterceptors",
  "APIKeyLocation",
  "Any",
  "AnyObject",
  "Array",
  "Auth",
  "Bool",
  "Codable",
  "CodingKey",
  "CodingKeys",
  "Data",
  "Date",
  "Decimal",
  "Decodable",
  "Decoder",
  "Dictionary",
  "Double",
  "Encodable",
  "Encoder",
  "Error",
  "Float",
  "HTTPURLResponse",
  "Int",
  "Int64",
  "JSONDecoder",
  "JSONEncoder",
  "JSONValue",
  "MultipartFormBody",
  "Never",
  "Optional",
  "QueryStyle",
  "RequestOptions",
  "Result",
  "Self",
  "Set",
  "String",
  "Task",
  "Type",
  "URL",
  "URLComponents",
  "URLEncoding",
  "URLQueryItem",
  "URLRequest",
  "URLResponse",
  "URLSession",
  "URLSessionAPIError",
  "UUID",
  "Void",
]);

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
  return new Namespace({
    normalize: swiftTypeIdent,
    reserved: RESERVED_TYPE_NAMES,
  });
}
