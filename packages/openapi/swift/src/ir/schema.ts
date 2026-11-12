import type { IR } from "@hey-api/shared";
import type { Namespace } from "@ir-kit/codegen-core";
import {
  fromHeyApi,
  refName,
  type Schema,
  schemaTypeName,
} from "@ir-kit/openapi";
import type { SwDecl } from "../ast/index.js";
import { swAny, swDict, swRef, swString, swTypeAlias } from "../ast/index.js";
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
 *
 * Schemas come in as hey-api's `IR.SchemaObject` and are folded to
 * canonical {@link Schema} at the boundary.
 */
export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
  names: Namespace = newTypeNames(),
): SwDecl[] {
  const decls: SwDecl[] = [];
  const emit = (d: SwDecl) => decls.push(d);

  // Components claim their names before any synthesized inline type.
  for (const rawName of Object.keys(schemas)) schemaTypeName(names, rawName);

  for (const [rawName, heySchema] of Object.entries(schemas)) {
    const name = schemaTypeName(names, rawName);
    const schema = fromHeyApi(heySchema);

    if (schema.$ref) {
      decls.push(
        swTypeAlias({
          name,
          type: swRef(schemaTypeName(names, refName(schema.$ref))),
        }),
      );
      continue;
    }
    const isEnum = Array.isArray(schema.enum) && schema.enum.length > 0;
    if (isEnum) {
      buildEnumFromIR(name, schema, emit, names);
      continue;
    }
    if (schema.type === "object" && schema.properties) {
      decls.push(buildStruct(name, schema, { emit, names }));
      continue;
    }
    if (schema.type === "object") {
      const ap = schema.additionalProperties;
      const sealed = ap === false;
      if (sealed) {
        decls.push(buildStruct(name, schema, { emit, names }));
        continue;
      }
      const valueType =
        ap && typeof ap === "object"
          ? schemaToType(ap, { emit, names, ownerName: name, propPath: [] })
          : swAny;
      decls.push(swTypeAlias({ name, type: swDict(swString, valueType) }));
      continue;
    }
    decls.push(
      swTypeAlias({
        name,
        type: schemaToType(schema, {
          emit,
          names,
          ownerName: name,
          propPath: [],
        }),
      }),
    );
  }

  return decls;
}
