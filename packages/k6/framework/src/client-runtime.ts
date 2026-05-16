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

/** Parse a k6 response body as JSON. Decodes ArrayBuffer bodies as UTF-8. */
export function parseJson(res: { body: string | ArrayBuffer | null }): unknown {
  const body = res.body;
  if (body === null || body === undefined) return undefined;
  if (typeof body === "string") {
    return body.length ? JSON.parse(body) : undefined;
  }
  if (body.byteLength === 0) return undefined;
  return JSON.parse(new TextDecoder("utf-8").decode(body));
}

/** Stamp every k6 request with `{ operation: id }`; `op` always wins. */
export function mergeTags(op: string, extra: HeaderMap | undefined): HeaderMap {
  return { ...(extra ?? {}), operation: op };
}
