import type { HeaderMap } from "./runtime.js";

/** Build a `?k=v&k2=v2` query string from a record. Skips null/undefined values. */
export function buildQuery(p: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === null) continue;
    const key = encodeURIComponent(k);
    if (Array.isArray(v)) {
      for (const item of v) {
        parts.push(`${key}=${encodeURIComponent(String(item))}`);
      }
    } else {
      parts.push(`${key}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

/** Parse a k6 response body as JSON, returning `undefined` for empty bodies. */
export function parseJson(res: { body: string | ArrayBuffer | null }): unknown {
  return res.body ? JSON.parse(res.body as string) : undefined;
}

/** Stamp every k6 request with `{ operation: id }` so per-op metrics work. */
export function mergeTags(op: string, extra: HeaderMap | undefined): HeaderMap {
  return { operation: op, ...(extra ?? {}) };
}
