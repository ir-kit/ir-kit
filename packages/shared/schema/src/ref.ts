/**
 * Last `/`-separated segment of a JSON-pointer ref (with `~1`/`~0`
 * decoded) — the conventional codegen "schema name". Handles both
 * `#/$defs/X` (2020-12) and `#/components/schemas/X` (OpenAPI)
 * uniformly. External / empty refs are returned untouched.
 */
export function refName(ref: string): string {
  if (!ref) return ref;
  const hashIdx = ref.lastIndexOf("#");
  const fragment = hashIdx >= 0 ? ref.slice(hashIdx + 1) : ref;
  const last = fragment.split("/").pop();
  if (!last) return ref;
  return last.replace(/~1/g, "/").replace(/~0/g, "~");
}
