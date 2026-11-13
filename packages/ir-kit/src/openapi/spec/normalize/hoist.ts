import { preserveMetadata } from "./metadata.js";

/** One inline schema occurrence: where it sits and its dedupe signature. */
export interface InlineHit {
  parent: Record<string, unknown> | unknown[];
  key: string | number;
  signature: string;
  schema: unknown;
}

/**
 * Add each named group's first schema to `components.schemas` (unless a
 * schema with that name already exists), then point every occurrence at it.
 */
export function hoistGroups(
  schemas: Record<string, unknown>,
  pointerPrefix: string,
  groups: ReadonlyMap<string, ReadonlyArray<InlineHit>>,
  nameBySignature: ReadonlyMap<string, string>,
  hoisted: Set<string>,
): void {
  for (const [signature, name] of nameBySignature) {
    if (name in schemas) continue;
    const group = groups.get(signature) ?? [];
    const schema = group[0]?.schema;
    if (schema && typeof schema === "object") {
      const target = schema as Record<string, unknown>;
      preserveMetadata(group, target);
      schemas[name] = target;
      hoisted.add(name);
    }
  }
  for (const [signature, name] of nameBySignature) {
    for (const { parent, key } of groups.get(signature) ?? []) {
      const ref = { $ref: `${pointerPrefix}${name}` };
      if (Array.isArray(parent)) parent[key as number] = ref;
      else parent[key as string] = ref;
    }
  }
}

/** Name source for a hoisted schema: its `title`, else the key it sat under. */
export function canonicalBase(schema: unknown, key: string | number): string {
  if (schema && typeof schema === "object" && "title" in schema) {
    const title = (schema as Record<string, unknown>).title;
    if (typeof title === "string" && title) return title;
  }
  return String(key);
}
