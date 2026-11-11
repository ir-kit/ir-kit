import {
  avoidLeadingDigit,
  camel,
  escapeIfReserved,
  Namespace,
  pascal,
  safeIdent,
} from "@ir-kit/codegen-core";

import { GO_RUNTIME_IDENTIFIERS } from "./runtime/templates.js";

/**
 * Go-specific identifier transforms. Generic case helpers (`pascal`,
 * `camel`, `safeIdent`, `safeCaseName`) live in `@ir-kit/codegen-core`
 * and are used directly by Go-targeted code. The exports here cover
 * what's actually unique to Go:
 *
 *  - `paramIdent` escapes reserved keywords with a trailing underscore
 *    (Go has no backtick-escape form, unlike Swift / Kotlin).
 *  - `synthName` joins with no separator since `go vet` lints
 *    underscored type names.
 *  - `enumEntrySuffix` normalizes a raw enum value into the second
 *    half of a typed-const name (`StatusAvailable`).

/** Returns a Go-safe identifier — escapes reserved keywords with a
 *  trailing underscore (Go has no backtick form). */
export function paramIdent(name: string): string {
  return escapeIfReserved(
    avoidLeadingDigit(camel(name)),
    GO_PARAM_RESERVED,
    (s) => `${s}_`,
  );
}

/**
 * Synthetic name for inline objects / enums promoted to top-level
 * decls. Go's convention is PascalCase with no underscores, so we
 * concatenate parts directly (`OwnerProperty`) — diverges from
 * swift/kotlin's `Owner_Property` to match `go vet` lints
 * (underscored type names trigger warnings).
 */
export function synthName(owner: string, path: ReadonlyArray<string>): string {
  return [owner, ...path.map(pascal)].join("");
}

/**
 * Constant-style identifier for a single `iota`-free typed enum
 * entry. Convention for OpenAPI string enums in Go is
 * `<TypeName><PascalCasedRaw>` — e.g. `Status` enum value
 * `"available"` → `StatusAvailable`. The caller passes the type name
 * separately; this helper just normalizes the raw value.
 *
 * Functionally `safeIdent(rawValue) || "Empty"` — `safeIdent` already
 * does pascal + leading-digit guard. The `|| "Empty"` fallback handles
 * raws that pascal away to nothing (e.g. `"---"`).
 */
export function enumEntrySuffix(rawValue: string): string {
  return safeIdent(rawValue) || "Empty";
}

/**
 * Go's reserved keywords. From the language spec — these can't be used
 * as identifiers at all, even with backticks (Go has no backtick-escape
 * form, unlike Swift / Kotlin). Collisions get a trailing underscore
 * appended.
 */
const GO_RESERVED_KEYWORDS: ReadonlySet<string> = new Set([
  "break",
  "case",
  "chan",
  "const",
  "continue",
  "default",
  "defer",
  "else",
  "fallthrough",
  "for",
  "func",
  "go",
  "goto",
  "if",
  "import",
  "interface",
  "map",
  "package",
  "range",
  "return",
  "select",
  "struct",
  "switch",
  "type",
  "var",
]);

/** Owns every top-level Go type name for one generation run. */
export function newTypeNames(): Namespace {
  return new Namespace({
    normalize: (s) => safeIdent(s) || "Empty",
    reserved: GO_RUNTIME_IDENTIFIERS,
  });
}

/**
 * Function-scope identifiers every generated method body declares, plus
 * the packages generated files import. A parameter spelled like one of
 * these would shadow it (`path` hides `path.Join`, `body` collides with
 * `body, resp, err := ExecuteRaw(...)`).
 */
const GO_BODY_SCOPE: ReadonlyArray<string> = [
  "body",
  "client",
  "ctx",
  "err",
  "form",
  "multipart",
  "opts",
  "payload",
  "q",
  "req",
  "resp",
  "respBody",
  "result",
  "u",
  "bytes",
  "context",
  "errors",
  "fmt",
  "http",
  "io",
  "json",
  "path",
  "strconv",
  "strings",
  "time",
  "url",
];

const GO_PARAM_RESERVED: ReadonlySet<string> = new Set([
  ...GO_RESERVED_KEYWORDS,
  ...GO_BODY_SCOPE,
]);
