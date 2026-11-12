type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

interface Flattened {
  properties: Json;
  required: string[];
}

/**
 * Rewrite every `allOf` whose members are all objects (inline or via a
 * local `$ref`) into one object schema carrying the members' combined
 * properties. Protobuf has no inheritance, so a message must list every
 * inherited field itself. Mutates `doc`; `allOf`s that mix in unions or
 * non-object types are left alone.
 */
export function mergeObjectAllOf(doc: Json): void {
  const resolve = (node: Json): Json | undefined => {
    let current: Json | undefined = node;
    for (let depth = 0; current && typeof current.$ref === "string"; depth++) {
      if (depth > 32) return undefined;
      current = pointer(doc, current.$ref);
    }
    return current;
  };

  const flatten = (
    node: Json,
    seen: ReadonlySet<Json>,
  ): Flattened | undefined => {
    const target = resolve(node);
    if (!target || seen.has(target)) return undefined;
    if (target.oneOf || target.anyOf || target.not) return undefined;
    if (target.type !== undefined && target.type !== "object") return undefined;
    const nextSeen = new Set(seen).add(target);
    const properties: Json = {};
    const required = new Set<string>();
    if (Array.isArray(target.allOf)) {
      for (const member of target.allOf) {
        if (!isObject(member)) return undefined;
        const flat = flatten(member, nextSeen);
        if (!flat) return undefined;
        mergeProperties(properties, flat.properties);
        for (const r of flat.required) required.add(r);
      }
    }
    if (isObject(target.properties))
      mergeProperties(properties, target.properties);
    if (Array.isArray(target.required)) {
      for (const r of target.required) {
        if (typeof r === "string") required.add(r);
      }
    }
    return { properties, required: [...required] };
  };

  const isObjectSchema = (node: unknown): boolean => {
    const target = isObject(node) ? resolve(node) : undefined;
    return (
      target !== undefined &&
      (target.type === "object" ||
        isObject(target.properties) ||
        Array.isArray(target.allOf))
    );
  };

  /** A property several members declare as an object keeps every
   *  member's fields: the walk below flattens the nested `allOf`. */
  function mergeProperties(into: Json, from: Json): void {
    for (const [key, schema] of Object.entries(from)) {
      const prev = into[key];
      into[key] =
        prev !== undefined &&
        prev !== schema &&
        isObjectSchema(prev) &&
        isObjectSchema(schema)
          ? { allOf: [prev, schema] }
          : schema;
    }
  }

  const visited = new WeakSet<object>();
  const walk = (node: unknown): void => {
    if (typeof node !== "object" || node === null || visited.has(node)) return;
    visited.add(node);
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    const obj = node as Json;
    if (Array.isArray(obj.allOf) && obj.allOf.length > 0) {
      const flat = flatten(obj, new Set());
      if (flat && Object.keys(flat.properties).length > 0) {
        delete obj.allOf;
        obj.type = "object";
        obj.properties = flat.properties;
        if (flat.required.length > 0) obj.required = flat.required;
        else delete obj.required;
      }
    }
    for (const value of Object.values(obj)) walk(value);
  };
  walk(doc);
}

function pointer(doc: Json, ref: string): Json | undefined {
  if (!ref.startsWith("#/")) return undefined;
  let current: unknown = doc;
  for (const raw of ref.slice(2).split("/")) {
    const key = decodeURIComponent(raw).replace(/~1/g, "/").replace(/~0/g, "~");
    if (!isObject(current)) return undefined;
    current = current[key];
  }
  return isObject(current) ? current : undefined;
}
