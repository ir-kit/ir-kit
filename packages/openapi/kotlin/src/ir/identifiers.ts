import {
  avoidLeadingDigit,
  escapeIfReserved,
  softCamel,
} from "@ir-kit/codegen-core";

/**
 * Kotlin-specific identifier transforms. Generic case helpers
 * (`pascal`, `camel`, `safeIdent`, `safeCaseName`, `synthName`,
 * `softCamel`, `escapeIfReserved`, `avoidLeadingDigit`) live in
 * `@ir-kit/codegen-core`. The exports here cover what's unique to
 * Kotlin: reserved-keyword backtick-escaping and SCREAMING_SNAKE
 * enum entry names.
 */

/**
 * Translate an arbitrary string to a Kotlin identifier safe to use as
 * a parameter / property name. Reserved keywords are escaped with
 * backticks (Kotlin's syntax for arbitrary identifiers). Uses
 * `softCamel` (preserves first-letter casing) so PascalCase inputs
 * pass through unchanged.
 */
export function paramIdent(name: string): string {
  return escapeIfReserved(
    avoidLeadingDigit(softCamel(name)),
    KOTLIN_RESERVED_KEYWORDS,
    (s) => `\`${s}\``,
  );
}

/**
 * Constant-style identifier for enum entries — `SCREAMING_SNAKE_CASE`.
 * Kotlin convention for `enum class` entry names. Falls back to a
 * leading underscore if the result starts with a digit.
 */
export function enumEntryIdent(s: string): string {
  const cleaned = s.replace(/[^a-zA-Z0-9]+/g, "_");
  // Split on case boundaries so "firstName" -> ["first", "Name"] -> FIRST_NAME.
  const parts = cleaned
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/_+/)
    .filter(Boolean);
  const upper = parts.join("_").toUpperCase();
  return avoidLeadingDigit(upper) || "EMPTY";
}

/**
 * Kotlin's hard keywords (the ones that can't be used as identifiers
 * unbacktick-escaped). Picked from the Kotlin reference's "Keywords
 * and operators" section. Soft keywords (`override`, `data`, `inline`,
 * `suspend`, etc.) are valid identifiers and don't need escaping.
 */
const KOTLIN_RESERVED_KEYWORDS: ReadonlySet<string> = new Set([
  "as",
  "break",
  "class",
  "continue",
  "do",
  "else",
  "false",
  "for",
  "fun",
  "if",
  "in",
  "interface",
  "is",
  "null",
  "object",
  "package",
  "return",
  "super",
  "this",
  "throw",
  "true",
  "try",
  "typealias",
  "typeof",
  "val",
  "var",
  "when",
  "while",
]);
