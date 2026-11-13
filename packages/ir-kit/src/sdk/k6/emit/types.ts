import { $ } from "@hey-api/openapi-ts";
import { safeIdent } from "../../../codegen/index.js";
import type { IR } from "../../../ir/index.js";

import { schemaToTypeNode } from "../ir/index.js";
import { GENERATED_HEADER, printDslNodes } from "../print.js";

export function emitTypesFile(
  schemas: Record<string, IR.Schema> | undefined,
): string {
  const decls = Object.entries(schemas ?? {}).map(([rawName, schema]) =>
    $.type.alias(safeIdent(rawName)).export().type(schemaToTypeNode(schema)),
  );
  if (!decls.length) return `${GENERATED_HEADER}\n\nexport {};\n`;
  return printDslNodes(decls, GENERATED_HEADER);
}
