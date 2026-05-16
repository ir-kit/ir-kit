import { safeIdent } from "@ahmedrowaihi/codegen-core";

/** Legal JS identifier preserving original casing — for fn/param slots. */
export function toIdent(input: string): string {
  const stripped = input.replace(/[^A-Za-z0-9_$]+/g, "_");
  const leading = /^[0-9]/.test(stripped) ? `_${stripped}` : stripped;
  return leading || "_";
}

/** `#/components/schemas/Pet` → `Pet`, run through `safeIdent`. */
export function refToTypeName(ref: string): string {
  const parts = ref.split("/");
  return safeIdent(parts[parts.length - 1] ?? "Unknown");
}
