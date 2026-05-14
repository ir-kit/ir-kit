/** Convert any string to a safe JS identifier (camelCase, no leading digit). */
export function toIdent(input: string): string {
  const stripped = input.replace(/[^A-Za-z0-9_$]+/g, "_");
  const leading = /^[0-9]/.test(stripped) ? `_${stripped}` : stripped;
  return leading || "_";
}

/** Pascal-case for type names: `pet-tag` → `PetTag`. */
export function toPascalCase(input: string): string {
  return input
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/**
 * Resolve the IR ref string to the type name it points at.
 * `#/components/schemas/Pet` → `Pet`.
 */
export function refToTypeName(ref: string): string {
  const parts = ref.split("/");
  return toPascalCase(parts[parts.length - 1] ?? "Unknown");
}
