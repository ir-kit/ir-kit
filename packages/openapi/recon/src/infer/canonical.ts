/**
 * Canonical JSON stringification — deterministic key ordering, used as a
 * dedup key for `ExampleBucket` and as a structural hash for `$ref`
 * dedupe. Assumes the input is the result of `JSON.parse` (no cycles, no
 * functions, no `undefined`).
 */
export function canonicalJSON(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
  );
  const out: Record<string, unknown> = {};
  for (const [k, v] of entries) out[k] = canonicalize(v);
  return out;
}
