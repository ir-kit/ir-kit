/**
 * Templating heuristic — given multiple concrete paths observed for the same
 * operation, produce an OpenAPI path template (`{paramName}`) and infer the
 * primitive type for each templated segment.
 */

const INT_RE = /^\d+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX_ID_RE = /^[0-9a-f]{16,}$/i;

/** Segments that are identifiers on their own, without needing peers to vary: integers, UUIDs, long hex ids. */
function isStrongId(value: string): boolean {
  return INT_RE.test(value) || UUID_RE.test(value) || HEX_ID_RE.test(value);
}

// "ID-like" = numeric, UUID, or a slug containing at least one digit (`item-12ab`).
// Pure-alphabetic words like `active`, `me`, `latest` are NOT id-like — leaving
// them as literal segments avoids the `/users/active` vs `/users/123` collision.
function isIdLike(value: string): boolean {
  if (isStrongId(value)) return true;
  return /\d/.test(value) && /^[A-Za-z0-9._~-]+$/.test(value);
}

export interface TemplatedPath {
  template: string;
  paramTypes: Record<string, "string" | "integer">;
}

/** A single observation can't be templated — return it as-is, no params. */
export function templateSinglePath(pathname: string): TemplatedPath {
  return { template: pathname, paramTypes: {} };
}

/**
 * Template `rawPath` segment by segment. A segment becomes a parameter when it
 * is a strong id (integer, UUID, long hex) on its own, or when it is id-like
 * and peers with the same shape and prefix carry other id-like values there.
 * Other segments stay literal, so `/users/me` and `/users/{userId}` coexist.
 */
export function templatePathFor(
  rawPath: string,
  allPaths: ReadonlyArray<string>,
): TemplatedPath {
  const segs = rawPath.split("/");
  const peers = allPaths
    .map((p) => p.split("/"))
    .filter((p) => p.length === segs.length);
  const segments: string[] = [];
  const paramTypes: Record<string, "string" | "integer"> = {};
  const usedNames = new Set<string>();

  segs.forEach((value, i) => {
    const varied = peers
      .filter((peer) =>
        segments.every((seg, j) =>
          seg.startsWith("{") ? isIdLike(peer[j]) : peer[j] === seg,
        ),
      )
      .map((peer) => peer[i])
      .filter((v) => v !== value && isIdLike(v));
    const isParam =
      value !== "" &&
      (isStrongId(value) || (isIdLike(value) && varied.length > 0));
    if (!isParam) {
      segments.push(value);
      return;
    }
    const name = paramNameFromContext(segments, usedNames);
    usedNames.add(name);
    paramTypes[name] = [value, ...varied].every((v) => INT_RE.test(v))
      ? "integer"
      : "string";
    segments.push(`{${name}}`);
  });

  return { template: segments.join("/"), paramTypes };
}

/**
 * Template a set of paths that all share the same operation (same method).
 * Returns `null` if the paths can't be safely unified — callers should fall
 * back to per-path templating (e.g. `templateSinglePath`).
 *
 * Safety rule: at every segment position where values differ, EVERY value
 * must be id-like (numeric, UUID, or slug-with-digit). Mixed cases like
 * `/users/me` vs `/users/123` are refused — collapsing them into
 * `/users/{userId}` would silently merge a static endpoint with a dynamic
 * one.
 */
export function templatePaths(
  paths: ReadonlyArray<string>,
): TemplatedPath | null {
  if (paths.length === 0) return { template: "/", paramTypes: {} };
  if (paths.length === 1) return templateSinglePath(paths[0]);

  const split = paths.map((p) => p.split("/"));
  const segCount = split[0].length;
  if (!split.every((s) => s.length === segCount)) return null;

  const segments: string[] = [];
  const paramTypes: Record<string, "string" | "integer"> = {};
  const usedNames = new Set<string>();

  for (let i = 0; i < segCount; i++) {
    const values = split.map((s) => s[i]);
    const distinct = new Set(values);

    if (distinct.size === 1) {
      segments.push(values[0]);
      continue;
    }

    if (!values.every(isIdLike)) return null;

    const type: "string" | "integer" = values.every((v) => INT_RE.test(v))
      ? "integer"
      : "string";
    const baseName = paramNameFromContext(segments, usedNames);
    usedNames.add(baseName);
    paramTypes[baseName] = type;
    segments.push(`{${baseName}}`);
  }

  return { template: segments.join("/"), paramTypes };
}

/**
 * Derive a parameter name from the previous literal segment.
 * `/users/{?}` → `userId`. If no usable predecessor, fall back to `paramN`.
 */
function paramNameFromContext(
  prior: ReadonlyArray<string>,
  used: Set<string>,
): string {
  for (let i = prior.length - 1; i >= 0; i--) {
    const seg = prior[i];
    if (!seg || seg.startsWith("{")) continue;
    const cleaned = seg.replace(/[^a-zA-Z0-9]/g, "");
    if (!cleaned) continue;
    const candidate = `${toCamelCase(singularize(cleaned))}Id`;
    if (!used.has(candidate)) return candidate;
    let n = 2;
    while (used.has(`${candidate}${n}`)) n++;
    return `${candidate}${n}`;
  }
  let n = 1;
  while (used.has(`param${n}`)) n++;
  return `param${n}`;
}

/** Crude singularizer — strip trailing `s` if present. Good enough for path segment naming. */
function singularize(word: string): string {
  if (word.length > 1 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Lowercase camelCase. Splits on case transitions and non-alphanumeric chars,
 * then joins with a leading-lowercase / Title-cased word pattern. Pure JS —
 * no external dep so the package stays browser-clean.
 */
function toCamelCase(s: string): string {
  if (!s) return s;
  const words = s
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      return i === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
    })
    .join("");
}
