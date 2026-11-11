import type { IR } from "@hey-api/shared";
import type { Namespace } from "@ir-kit/codegen-core";
import {
  fromHeyApi,
  refName,
  type Schema,
  schemaTypeName,
} from "@ir-kit/openapi";

import {
  type GoDecl,
  goAny,
  goMap,
  goRef,
  goString,
  goTypeAlias,
} from "../go-dsl/index.js";
import { newTypeNames } from "./identifiers.js";
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
  names: Namespace = newTypeNames(),
): GoDecl[] {
  const decls: GoDecl[] = [];
  const emit = (d: GoDecl) => decls.push(d);

  // Components claim their names before any synthesized inline type.
  for (const rawName of Object.keys(schemas)) schemaTypeName(names, rawName);

  for (const [rawName, heySchema] of Object.entries(schemas)) {
    const name = schemaTypeName(names, rawName);
    const schema = fromHeyApi(heySchema);

    if (schema.$ref) {
      decls.push(
        goTypeAlias({
          name,
          type: goRef(schemaTypeName(names, refName(schema.$ref))),
          alias: true,
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
          : goAny;
      decls.push(goTypeAlias({ name, type: goMap(goString, valueType) }));
      continue;
    }
    decls.push(
      goTypeAlias({
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
