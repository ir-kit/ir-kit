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
