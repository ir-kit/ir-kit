import type { IR } from "@hey-api/shared";

/**
 * One part of a parsed URL path template segment.
 *  - `literal` — a literal substring with no `{...}` placeholder
 *  - `param`   — a `{name}` placeholder, with the matched
 *                `ParameterObject` if found in the supplied path
 *                params (callers typically need the schema to decide
 *                stringification, plus the raw name to feed their
 *                language-specific identifier transform).
 */
export type TemplatePart =
  | { kind: "literal"; text: string }
  | { kind: "param"; name: string; param: IR.ParameterObject | undefined };

/**
 * Split a single path segment containing zero or more `{name}` template
 * placeholders into ordered literal/param parts. The regex (`/\{([^}]+)\}/g`)
 * + lastEnd cursor walk was open-coded identically in every emitter's
 * `impl/url.ts`; here once, in one place.
 *
 * `pathParams` is the operation's path-located params; resolved
 * placeholders carry the matched `ParameterObject` so emitters can
 * read its schema (e.g. for stringification decisions).
 */
export function parseTemplatedSegment(
  seg: string,
  pathParams: ReadonlyArray<IR.ParameterObject>,
): TemplatePart[] {
  const re = /\{([^}]+)\}/g;
  const parts: TemplatePart[] = [];
  let lastEnd = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(seg)) !== null) {
    if (m.index > lastEnd) {
      parts.push({ kind: "literal", text: seg.slice(lastEnd, m.index) });
    }
    const name = m[1]!;
    parts.push({
      kind: "param",
      name,
      param: pathParams.find((p) => p.name === name),
    });
    lastEnd = m.index + m[0].length;
  }
  if (lastEnd < seg.length) {
    parts.push({ kind: "literal", text: seg.slice(lastEnd) });
  }
  return parts;
}
