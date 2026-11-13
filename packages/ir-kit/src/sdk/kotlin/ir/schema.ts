import type { IR } from "@hey-api/shared";
import type { Namespace } from "../../../codegen/index.js";
import { classifyComponents } from "../../../openapi/index.js";

import {
  type KtDecl,
  ktJsonElement,
  ktMap,
  ktRef,
  ktString,
  ktTypeAlias,
} from "../ast/index.js";
import { newTypeNames } from "./identifiers.js";
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
 */
export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
  names: Namespace = newTypeNames(),
): KtDecl[] {
  const decls: KtDecl[] = [];
  const emit = (d: KtDecl) => decls.push(d);
  for (const { name, schema, shape } of classifyComponents(schemas, names)) {
    const ctx = () => ({ emit, names, ownerName: name, propPath: [] });
    switch (shape.kind) {
      case "ref":
        decls.push(ktTypeAlias({ name, type: ktRef(shape.target) }));
        break;
      case "enum":
        buildEnumFromIR(name, schema, emit, names);
        break;
      case "struct":
        decls.push(buildStruct(name, schema, { emit, names }));
        break;
      case "map":
        decls.push(
          ktTypeAlias({
            name,
            type: ktMap(
              ktString,
              shape.value ? schemaToType(shape.value, ctx()) : ktJsonElement,
            ),
          }),
        );
        break;
      case "type":
        decls.push(ktTypeAlias({ name, type: schemaToType(schema, ctx()) }));
        break;
    }
  }
  return decls;
}
