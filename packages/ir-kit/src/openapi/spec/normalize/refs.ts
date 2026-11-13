import { uniqueComponentName } from "./name.js";
import { getSchemasObject, schemasPointerPrefix } from "./walk.js";

const STRUCTURAL = new Set([
  "additionalProperties",
  "allOf",
  "anyOf",
  "content",
  "items",
  "not",
  "oneOf",
  "properties",
  "schema",
]);

function decodePointer(ref: string): string[] {
  return ref
    .slice(2)
    .split("/")
    .map((s) => decodeURIComponent(s).replace(/~1/g, "/").replace(/~0/g, "~"));
}

function resolvePointer(spec: unknown, segments: ReadonlyArray<string>) {
  let node: unknown = spec;
  for (const seg of segments) {
    if (!node || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[seg];
  }
  return node;
}

function visitRefs(
  node: unknown,
  visit: (holder: Record<string, unknown>, ref: string) => void,
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) visitRefs(item, visit);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (typeof obj.$ref === "string") visit(obj, obj.$ref);
  for (const v of Object.values(obj)) visitRefs(v, visit);
}

function nameFor(segments: ReadonlyArray<string>): string {
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (!STRUCTURAL.has(seg) && !/^\d+$/.test(seg) && !seg.includes("/"))
      return seg;
  }
  return "Schema";
}

/**
 * Give every schema that is `$ref`'d from outside the components section
 * (e.g. `#/paths/~1apps/get/responses/200/.../properties/cors`) a home in
 * `components.schemas`, and point those refs at it. Generators then only
 * ever see refs to declared components. Returns the added schema names.
 */
export function hoistForeignSchemaRefs(spec: unknown): Set<string> {
  const added = new Set<string>();
  const schemas = getSchemasObject(spec);
  const prefix = schemasPointerPrefix(spec);
  if (!schemas || !prefix) return added;

  const isForeign = (ref: string) => {
    if (!ref.startsWith("#/") || ref.startsWith("#/components/")) return false;
    if (ref.startsWith("#/definitions/")) return false;
    return decodePointer(ref).some((s) => s === "schema" || s === "schemas");
  };

  const targets = new Map<string, string>();
  visitRefs(spec, (_, ref) => {
    if (!isForeign(ref) || targets.has(ref)) return;
    const segments = decodePointer(ref);
    let target = resolvePointer(spec, segments);
    if (!target || typeof target !== "object") return;
    const inner = (target as Record<string, unknown>).$ref;
    if (typeof inner === "string" && !isForeign(inner)) {
      targets.set(ref, inner);
      return;
    }
    const name = uniqueComponentName(nameFor(segments), schemas, added);
    target = structuredClone(target);
    schemas[name] = target;
    added.add(name);
    targets.set(ref, `${prefix}${name}`);
  });

  if (targets.size === 0) return added;
  visitRefs(spec, (holder, ref) => {
    const next = targets.get(ref);
    if (next) holder.$ref = next;
  });
  return added;
}
