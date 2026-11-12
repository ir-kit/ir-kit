import type { IR } from "@hey-api/shared";
import type { Namespace } from "@ir-kit/codegen-core";
import { classifyComponents } from "@ir-kit/openapi";

import { type JEmitted, jMap, jObject, jRef } from "../ast/index.js";
import { newTypeNames } from "./identifiers.js";
import { buildEnumFromIR, buildStruct, schemaToType } from "./type/index.js";

export function schemasToDecls(
  schemas: Record<string, IR.SchemaObject>,
  names: Namespace = newTypeNames(),
): JEmitted[] {
  const decls: JEmitted[] = [];
  const emit = (d: JEmitted) => decls.push(d);
  for (const { name, schema, shape } of classifyComponents(schemas, names)) {
    const ctx = () => ({ emit, names, ownerName: name, propPath: [] });
    switch (shape.kind) {
      case "ref":
        emit({ kind: "alias", name, target: jRef(shape.target) });
        break;
      case "enum":
        buildEnumFromIR(name, schema, emit, names);
        break;
      case "struct":
        emit(buildStruct(name, schema, { emit, names }));
        break;
      case "map":
        emit({
          kind: "alias",
          name,
          target: jMap(
            shape.value ? schemaToType(shape.value, ctx()) : jObject,
          ),
        });
        break;
      case "type":
        emit({ kind: "alias", name, target: schemaToType(schema, ctx()) });
        break;
    }
  }
  return decls;
}
