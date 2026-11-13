/**
 * Algorithm adapted from @hey-api/openapi-ts (MIT) —
 * `packages/shared/src/openApi/shared/transforms/enums.ts` `rootMode`.
 * Deviations: signature includes `format`; only the `'root'` direction
 * is supported; metadata is reconciled across hits (see `metadata.ts`).
 */

import { canonicalBase, hoistGroups, type InlineHit } from "./hoist.js";
import type { NamingConfig } from "./name.js";
import { applyNaming, uniqueComponentName } from "./name.js";
import {
  getSchemasObject,
  isRootSchemaPath,
  schemasPointerPrefix,
  walkSchemas,
} from "./walk.js";

export interface EnumPassOptions {
  naming?: NamingConfig;
}

const DEFAULT_NAMING: NamingConfig = {
  case: "PascalCase",
  name: "{{name}}Enum",
};

/**
 * Hoist identical inline enums to `components.schemas` and rewrite each
 * occurrence as a `$ref`. Returns the set of newly-added schema names.
 */
export function dedupeInlineEnums(
  spec: unknown,
  opts: EnumPassOptions = {},
): Set<string> {
  const hoisted = new Set<string>();
  const schemas = getSchemasObject(spec);
  if (!schemas) return hoisted;
  const pointerPrefix = schemasPointerPrefix(spec);
  if (!pointerPrefix) return hoisted;

  const naming = opts.naming ?? DEFAULT_NAMING;

  const existingBySignature: Record<string, string> = {};
  for (const [name, schema] of Object.entries(schemas)) {
    const signature = enumSignature(schema);
    if (signature) existingBySignature[signature] = name;
  }

  const hits: InlineHit[] = [];
  const hitsBySignature = new Map<string, InlineHit[]>();
  walkSchemas(spec, ({ key, node, parent, path }) => {
    if (key === null || parent === null) return;
    if (isRootSchemaPath(path)) return;
    const signature = enumSignature(node);
    if (!signature) return;
    const hit: InlineHit = {
      parent: parent as Record<string, unknown> | unknown[],
      key: key as string | number,
      signature,
      schema: node,
    };
    hits.push(hit);
    const arr = hitsBySignature.get(signature);
    if (arr) arr.push(hit);
    else hitsBySignature.set(signature, [hit]);
  });
  if (hits.length === 0) return hoisted;

  const nameBySignature = new Map<string, string>();
  const reservedNames = new Set<string>();

  for (const { schema, signature, key } of hits) {
    if (nameBySignature.has(signature)) continue;
    const existingName = existingBySignature[signature];
    if (existingName) {
      nameBySignature.set(signature, existingName);
      continue;
    }
    const base = applyNaming(canonicalBase(schema, key), naming);
    const name = uniqueComponentName(base, schemas, reservedNames);
    reservedNames.add(name);
    nameBySignature.set(signature, name);
  }

  hoistGroups(
    schemas,
    pointerPrefix,
    hitsBySignature,
    nameBySignature,
    hoisted,
  );
  return hoisted;
}

/** Signature key: `(type, format, sorted enum values)`. Differs in `format` matters for typed languages. */
function enumSignature(schema: unknown): string | undefined {
  if (!schema || typeof schema !== "object") return undefined;
  const s = schema as Record<string, unknown>;
  if (!Array.isArray(s.enum)) return undefined;
  return JSON.stringify({
    type: s.type ?? "",
    format: s.format ?? "",
    values: [...s.enum].sort(),
  });
}
