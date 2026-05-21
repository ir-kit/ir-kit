import { $ } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import { safeIdent } from "@ir-kit/codegen-core";
import { fromHeyApi } from "@ir-kit/openapi";

import { schemaToFakerExpr } from "../ir/index.js";
import { GENERATED_HEADER, printDslNodes } from "../print.js";

/** Matches the namespace alias used by `emitClientFile`. */
const TYPE_NAMESPACE = "T";

export function emitDataFile(
  schemas: Record<string, IR.SchemaObject> | undefined,
): string {
  const entries = Object.entries(schemas ?? {});

  if (!entries.length) {
    return `${GENERATED_HEADER}\nexport const data = {} as const;\n`;
  }

  const preamble = `${GENERATED_HEADER}
import { faker } from "@faker-js/faker";
import type * as ${TYPE_NAMESPACE} from "./types.js";
`;

  let dataObj = $.object();
  for (const [rawName, heySchema] of entries) {
    const schema = fromHeyApi(heySchema);
    const name = safeIdent(rawName);
    const typeRef = $.type(`${TYPE_NAMESPACE}.${name}`);
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
