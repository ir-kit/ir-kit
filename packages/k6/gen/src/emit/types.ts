import { $ } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";

import { schemaToTypeNode, toPascalCase } from "../ir/index.js";
import { GENERATED_HEADER, printDslNodes } from "../print.js";

export function emitTypesFile(
  schemas: Record<string, IR.SchemaObject> | undefined,
): string {
  const decls = Object.entries(schemas ?? {}).map(([rawName, schema]) =>
    $.type.alias(toPascalCase(rawName)).export().type(schemaToTypeNode(schema)),
  );
  return printDslNodes(decls, GENERATED_HEADER);
}
