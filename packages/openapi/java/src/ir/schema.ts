import type { IR } from "@hey-api/shared";
import type { Namespace } from "@ir-kit/codegen-core";
import {
  fromHeyApi,
  refName,
  type Schema,
  schemaTypeName,
} from "@ir-kit/openapi";

import { type JEmitted, jMap, jObject, jRef } from "../ast/index.js";
import { newTypeNames } from "./identifiers.js";
import { buildEnumFromIR, buildStruct, schemaToType } from "./type/index.js";

export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
  names: Namespace = newTypeNames(),
): JEmitted[] {
  const decls: JEmitted[] = [];
  const emit = (d: JEmitted) => decls.push(d);

  for (const rawName of Object.keys(schemas)) schemaTypeName(names, rawName);

  for (const [rawName, heySchema] of Object.entries(schemas)) {
    const name = schemaTypeName(names, rawName);
    const schema: Schema = fromHeyApi(heySchema);
    const ctx = { emit, names, ownerName: name, propPath: [] };

    if (schema.$ref) {
      emit({
        kind: "alias",
        name,
        target: jRef(schemaTypeName(names, refName(schema.$ref))),
      });
    } else if (Array.isArray(schema.enum) && schema.enum.length > 0) {
      buildEnumFromIR(name, schema, emit, names);
    } else if (
      schema.type === "object" &&
      (schema.properties || schema.additionalProperties === false)
    ) {
      emit(buildStruct(name, schema, { emit, names }));
    } else if (schema.type === "object") {
      const ap = schema.additionalProperties;
      const value =
        ap && typeof ap === "object" ? schemaToType(ap, ctx) : jObject;
      emit({ kind: "alias", name, target: jMap(value) });
    } else {
      emit({ kind: "alias", name, target: schemaToType(schema, ctx) });
    }
  }
  return decls;
}
