/**
 * Identifier transforms shared by every native-SDK generator. All
 * functions here are pure string ↔ string — they do *not* know about
 * any target language's reserved-word set or visibility rules. Each
 * generator layers its own `paramIdent` / `exportedIdent` /
 * `enumEntryIdent` on top, calling these as primitives.
 *
 * The pascal regex deliberately strips both leading and trailing
 * non-alphanumeric runs so identifiers like `timeframe[]` (PHP-style
 * array param names from real-world specs) become `Timeframe`, not
 * `TimeframeNullNull` or similar. Wire-level names are unaffected —
 * generators preserve the original param.name when emitting the URL.
 */
export function pascal(s: string): string {
  return s
    .replace(/^[^a-zA-Z0-9]+/, "")
    .replace(/[^a-zA-Z0-9]+$/, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());
}

export function camel(s: string): string {
  const p = pascal(s);
  return p.length > 0 ? p[0]!.toLowerCase() + p.slice(1) : p;
}

/** PascalCase, prepended with `_` if it would otherwise start with a
 *  digit. Used wherever a type-name slot can't begin with a number. */
export function safeIdent(s: string): string {
  return avoidLeadingDigit(pascal(s));
}

/** camelCase, prepended with `_` if it would otherwise start with a
 *  digit. Used for enum case names where the source is numeric. */
export function safeCaseName(s: string): string {
  return avoidLeadingDigit(camel(s));
}

/**
 * Camel-like transform that PRESERVES the first character's casing —
 * collapses non-alnum word boundaries and uppercases the following
 * character. Diverges from `camel()` in that it does NOT lowercase
 * the leading letter, so `softCamel("FirstName")` stays `"FirstName"`
 * while `camel("FirstName")` returns `"firstName"`. Used by emitters
 * that want to respect user-given casing on parameter identifiers
 * while still normalising word boundaries (snake_case → camelCase but
 * already-cased inputs pass through).
 */
export function softCamel(s: string): string {
  return s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase());
}

/** Prepend `_` when the string would otherwise start with a digit;
 *  pass through unchanged otherwise. Most identifier-safe transforms
 *  end with this guard. */
export function avoidLeadingDigit(s: string): string {
  return /^[0-9]/.test(s) ? `_${s}` : s;
}

/** Wrap a name through a target-specific escape iff it collides with
 *  the target's reserved-keyword set. Centralises the
 *  `RESERVED.has(name) ? escape(name) : name` pattern each emitter's
 *  `paramIdent` open-coded. */
export function escapeIfReserved(
  name: string,
  reserved: ReadonlySet<string>,
  escape: (name: string) => string,
): string {
  return reserved.has(name) ? escape(name) : name;
}

/**
 * Build a synthetic top-level type name for an inline schema, owned
 * by some declared type. The owner part stays as-is so collisions
 * across owners are impossible (`User_Address` vs `Order_Address`).
 * Path segments get pascal'd individually so `["properties","streetName"]`
 * collapses to `User_Properties_StreetName` rather than running the
 * pascal regex over the joined string.
 */
export function synthName(owner: string, path: ReadonlyArray<string>): string {
  return [owner, ...path.map(pascal)].join("_");
}
