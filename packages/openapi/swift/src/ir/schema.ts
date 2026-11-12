import type { IR } from "@hey-api/shared";
import type { Namespace } from "@ir-kit/codegen-core";
import { classifyComponents } from "@ir-kit/openapi";
import type { SwDecl } from "../ast/index.js";
import {
  swDict,
  swJSONValue,
  swRef,
  swString,
  swTypeAlias,
} from "../ast/index.js";
import { newTypeNames } from "./identifiers.js";
import { buildEnumFromIR, buildStruct, schemaToType } from "./type/index.js";

/**
 * Translate `IR.Model.components.schemas` into Swift decls.
 *
 *  - object schemas with properties → `Codable` struct
 *  - enum schemas → `String`/`Int`-raw `Codable` enum
 *  - object schemas with only `additionalProperties` → typealias to
 *    `[String: V]`
 *  - everything else → typealias to the dispatcher's resolved type
 */
export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
  names: Namespace = newTypeNames(),
): SwDecl[] {
  const decls: SwDecl[] = [];
  const emit = (d: SwDecl) => decls.push(d);
  for (const { name, schema, shape } of classifyComponents(schemas, names)) {
    const ctx = () => ({ emit, names, ownerName: name, propPath: [] });
    switch (shape.kind) {
      case "ref":
        decls.push(swTypeAlias({ name, type: swRef(shape.target) }));
        break;
      case "enum":
        buildEnumFromIR(name, schema, emit, names);
        break;
      case "struct":
        decls.push(buildStruct(name, schema, { emit, names }));
        break;
      case "map":
        decls.push(
          swTypeAlias({
            name,
            type: swDict(
              swString,
              shape.value ? schemaToType(shape.value, ctx()) : swJSONValue,
            ),
          }),
        );
        break;
      case "type":
        decls.push(swTypeAlias({ name, type: schemaToType(schema, ctx()) }));
        break;
    }
  }
  return decls;
}
