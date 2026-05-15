import { safeIdent } from "@ahmedrowaihi/codegen-core";
import { $ } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";

import { schemaToFakerExpr } from "../ir/index.js";
import { GENERATED_HEADER, printDslNodes } from "../print.js";
import { formatTypeImport } from "./type-import.js";

export function emitDataFile(
  schemas: Record<string, IR.SchemaObject> | undefined,
): string {
  const entries = Object.entries(schemas ?? {});
  const typeNames = entries.map(([n]) => safeIdent(n));
  const typeImport = formatTypeImport(typeNames);
  const preamble = `${GENERATED_HEADER}
import { faker } from "@faker-js/faker";
${typeImport}`;

  if (!entries.length) {
    return `${preamble}\nexport const data = {} as const;\n`;
  }

  let dataObj = $.object();
  for (const [rawName, schema] of entries) {
    const name = safeIdent(rawName);
    const typeRef = $.type(name);
    const isObject = schema.type === "object" || !!schema.properties;

    const body = isObject
      ? $.object()
          .spread(schemaToFakerExpr(schema))
          .spread($("overrides").or($.object()))
          .as(typeRef)
      : $("overrides").or(schemaToFakerExpr(schema)).as(typeRef);

    const fn = $.func()
      .param("overrides", (p) => {
        const t = isObject ? $.type("Partial").generic(typeRef) : typeRef;
        return p.optional().type(t);
      })
      .returns(typeRef)
      .do($.return(body));

    dataObj = dataObj.prop(name, fn);
  }

  const decl = $.const("data").export().assign(dataObj);
  return `${preamble}\n${printDslNodes([decl])}`;
}
