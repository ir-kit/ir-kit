import type { IR } from "@hey-api/shared";
import { fromHeyApi, refName, type Schema } from "@ir-kit/openapi";

import {
  type GoDecl,
  goAny,
  goMap,
  goRef,
  goString,
  goTypeAlias,
} from "../go-dsl/index.js";
import { buildEnumFromIR, buildStruct, schemaToType } from "./type/index.js";

/**
 * Translate `IR.Model.components.schemas` into Go decls.
 *
 *  - object schemas with properties → struct
 *  - enum schemas → typed `string` alias + `const ( ... )` block
 *  - object schemas with only `additionalProperties` → map alias
 *  - everything else → typealias to the dispatcher's resolved type
 *
 * Schemas come in as hey-api's `IR.SchemaObject` (the normalized form
 * from `@hey-api/openapi-ts`); they're folded to canonical
 * {@link Schema} at the boundary so every downstream call uses the
 * canonical model.
 */
export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
): GoDecl[] {
  const decls: GoDecl[] = [];
  const emit = (d: GoDecl) => decls.push(d);

  for (const [name, heySchema] of Object.entries(schemas)) {
    const schema = fromHeyApi(heySchema);

    if (schema.$ref) {
      decls.push(
        goTypeAlias({ name, type: goRef(refName(schema.$ref)), alias: true }),
      );
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
          : goAny;
      decls.push(goTypeAlias({ name, type: goMap(goString, valueType) }));
      continue;
    }
    decls.push(
      goTypeAlias({
        name,
        type: schemaToType(schema, { emit, ownerName: name, propPath: [] }),
      }),
    );
  }

  return decls;
}
