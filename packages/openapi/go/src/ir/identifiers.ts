import {
  avoidLeadingDigit,
  camel,
  escapeIfReserved,
  pascal,
  safeIdent,
} from "@ir-kit/codegen-core";

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
    GO_RESERVED_KEYWORDS,
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
