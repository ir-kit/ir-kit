import { $ } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import { safeIdent } from "@ir-kit/codegen-core";
import { fromHeyApi } from "@ir-kit/openapi";

import { schemaToTypeNode } from "../ir/index.js";
import { GENERATED_HEADER, printDslNodes } from "../print.js";

export function emitTypesFile(
  schemas: Record<string, IR.SchemaObject> | undefined,
): string {
  const decls = Object.entries(schemas ?? {}).map(([rawName, schema]) =>
    $.type
      .alias(safeIdent(rawName))
      .export()
      .type(schemaToTypeNode(fromHeyApi(schema))),
  );
  if (!decls.length) return `${GENERATED_HEADER}\n\nexport {};\n`;
  return printDslNodes(decls, GENERATED_HEADER);
}
