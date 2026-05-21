import type { IR } from "@hey-api/shared";
import { fromHeyApi, refName, type Schema } from "@ir-kit/openapi";

import {
  type KtDecl,
  ktAny,
  ktMap,
  ktRef,
  ktString,
  ktTypeAlias,
} from "../kt-dsl/index.js";
import { buildEnumFromIR, buildStruct, schemaToType } from "./type/index.js";

/**
 * Translate `IR.Model.components.schemas` into Kotlin decls.
 *
 *  - object schemas with properties → `@Serializable` data class
 *  - enum schemas → `enum class(val raw: String)` (or `typealias = Int`
 *    for integer enums; kotlinx can't round-trip integer enums)
 *  - object schemas with only `additionalProperties` → typealias to
 *    `Map<String, V>`
 *  - everything else → typealias to the dispatcher's resolved type
 *
 * Schemas come in as hey-api's `IR.SchemaObject` and are folded to
 * canonical {@link Schema} at the boundary.
 */
export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
): KtDecl[] {
  const decls: KtDecl[] = [];
  const emit = (d: KtDecl) => decls.push(d);

  for (const [name, heySchema] of Object.entries(schemas)) {
    const schema = fromHeyApi(heySchema);

    if (schema.$ref) {
      decls.push(ktTypeAlias({ name, type: ktRef(refName(schema.$ref)) }));
      continue;
    }
    const isEnum = Array.isArray(schema.enum) && schema.enum.length > 0;
    if (isEnum) {
      buildEnumFromIR(name, schema, emit);
      continue;
    }
    if (schema.type === "object" && schema.properties) {
      decls.push(buildStruct(name, schema, { emit }));
      continue;
    }
    if (schema.type === "object") {
      const ap = schema.additionalProperties;
      const sealed = ap === false;
      if (sealed) {
        decls.push(buildStruct(name, schema, { emit }));
        continue;
      }
      const valueType =
        ap && typeof ap === "object"
          ? schemaToType(ap, { emit, ownerName: name, propPath: [] })
          : ktAny;
      decls.push(ktTypeAlias({ name, type: ktMap(ktString, valueType) }));
      continue;
    }
    decls.push(
      ktTypeAlias({
        name,
        type: schemaToType(schema, { emit, ownerName: name, propPath: [] }),
      }),
    );
  }

  return decls;
}
