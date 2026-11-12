import type { IR } from "@hey-api/shared";
import type { Namespace } from "@ir-kit/codegen-core";
import { classifyComponents } from "@ir-kit/openapi";

import {
  type GoDecl,
  goAny,
  goMap,
  goRef,
  goString,
  goTypeAlias,
} from "../ast/index.js";
import { newTypeNames } from "./identifiers.js";
import { buildEnumFromIR, buildStruct, schemaToType } from "./type/index.js";

/**
 * Translate `IR.Model.components.schemas` into Go decls.
 *
 *  - object schemas with properties → struct
 *  - enum schemas → typed `string` alias + `const ( ... )` block
 *  - object schemas with only `additionalProperties` → map alias
 *  - everything else → typealias to the dispatcher's resolved type
 */
export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
  names: Namespace = newTypeNames(),
): GoDecl[] {
  const decls: GoDecl[] = [];
  const emit = (d: GoDecl) => decls.push(d);
  for (const { name, schema, shape } of classifyComponents(schemas, names)) {
    const ctx = () => ({ emit, names, ownerName: name, propPath: [] });
    switch (shape.kind) {
      case "ref":
        decls.push(
          goTypeAlias({ name, type: goRef(shape.target), alias: true }),
        );
        break;
      case "enum":
        buildEnumFromIR(name, schema, emit, names);
        break;
      case "struct":
        decls.push(buildStruct(name, schema, { emit, names }));
        break;
      case "map":
        decls.push(
          goTypeAlias({
            name,
            type: goMap(
              goString,
              shape.value ? schemaToType(shape.value, ctx()) : goAny,
            ),
          }),
        );
        break;
      case "type":
        decls.push(goTypeAlias({ name, type: schemaToType(schema, ctx()) }));
        break;
    }
  }
  return decls;
}
