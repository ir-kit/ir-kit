/**
 * The supported leaf shape for `IR.SchemaObject` enum values. Mirrors
 * `EnumLiteral` from `@ir-kit/openapi-tools` — re-declared here to keep
 * the package's dependency footprint minimal (this is a 3-word union;
 * a workspace dep just to import it would be heavyweight).
 */
export type EnumLiteral = string | number | boolean;

export type EnumKind = "string" | "integer";

/**
 * Classify a set of enum literals as all-string or all-integer. Throws
 * on mixed (or otherwise unsupported) shapes. Each emitter then picks
 * its target rendering — Go emits `type ... string` + typed-consts,
 * Kotlin emits an `enum class(val raw: String)` or a typealias to
 * `Int`, Swift emits a raw-typed `enum: String, Codable`.
 *
 * `name` is woven into the thrown error message so the caller doesn't
 * have to re-wrap; emitter call-sites previously open-coded the same
 * `throw new Error(\`Enum ${name}: members must all be strings or all
 * integers; got ...\`)` line.
 */
export function classifyEnumLiterals(
  values: ReadonlyArray<EnumLiteral>,
  name: string,
): EnumKind {
  const allStrings = values.every((v) => typeof v === "string");
  const allIntegers = values.every(
    (v) => typeof v === "number" && Number.isInteger(v),
  );
  if (!allStrings && !allIntegers) {
    throw new Error(
      `Enum ${name}: members must all be strings or all integers; got ${JSON.stringify(values)}`,
    );
  }
  return allIntegers ? "integer" : "string";
}

export interface EnumEntryIdent<T extends string | number> {
  /** The identifier emitted into the target source (Go `StatusAvailable`,
   *  Kotlin `available`, Swift `available`). */
  identifier: string;
  /** The raw enum value the identifier was derived from. */
  raw: T;
}

/**
 * Detect emitter-side identifier collisions across enum entries and
 * throw a descriptive error. Each emitter normalises raw enum values
 * to its own identifier convention (Go `enumEntrySuffix`, Kotlin
 * `enumEntryIdent`, Swift `safeCaseName`); when two raw values
 * normalise to the same identifier the emitted source won't compile,
 * so we throw early with the offending name and the colliding raws.
 *
 * `noun` is the label used in the error message — kept per-emitter to
 * preserve historical wording (Go / Kotlin say `entry name`, Swift
 * says `case name`); tests pin the exact phrase.
 */
export function assertNoEnumCollisions<T extends string | number>(
  schemaName: string,
  entries: Iterable<EnumEntryIdent<T>>,
  noun: "entry name" | "case name" = "entry name",
): void {
  const collisions = new Map<string, T[]>();
  for (const { identifier, raw } of entries) {
    const list = collisions.get(identifier) ?? [];
    list.push(raw);
    collisions.set(identifier, list);
  }
  for (const [identifier, raws] of collisions) {
    if (raws.length > 1) {
      const formatted = raws
        .map((r) => (typeof r === "string" ? `"${r}"` : String(r)))
        .join(", ");
      throw new Error(
        `Enum ${schemaName}: ${noun} "${identifier}" collides for raw values [${formatted}]`,
      );
    }
  }
}
