import type { IR } from "@hey-api/shared";
import { fromHeyApi, refName, type Schema } from "@ir-kit/openapi";

import { swTypeAlias } from "../sw-dsl/decl/typeAlias.js";
import type { SwDecl } from "../sw-dsl/decl/types.js";
import { swAny, swDict, swRef, swString } from "../sw-dsl/type/index.js";
import { buildEnumFromIR, buildStruct, schemaToType } from "./type/index.js";

/**
 * Translate `IR.Model.components.schemas` into Swift decls.
 *
 *  - object schemas with properties → `Codable` struct
 *  - enum schemas → `String`/`Int`-raw `Codable` enum
 *  - object schemas with only `additionalProperties` → typealias to
 *    `[String: V]`
 *  - everything else → typealias to the dispatcher's resolved type
 *
 * Schemas come in as hey-api's `IR.SchemaObject` and are folded to
 * canonical {@link Schema} at the boundary.
 */
export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
): SwDecl[] {
  const decls: SwDecl[] = [];
  const emit = (d: SwDecl) => decls.push(d);

  for (const [name, heySchema] of Object.entries(schemas)) {
    const schema = fromHeyApi(heySchema);

    if (schema.$ref) {
      decls.push(swTypeAlias({ name, type: swRef(refName(schema.$ref)) }));
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
          : swAny;
      decls.push(swTypeAlias({ name, type: swDict(swString, valueType) }));
      continue;
    }
    decls.push(
      swTypeAlias({
        name,
        type: schemaToType(schema, { emit, ownerName: name, propPath: [] }),
      }),
    );
  }

  return decls;
}
