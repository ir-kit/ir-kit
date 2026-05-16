import { $ } from "@hey-api/openapi-ts";
import ts from "typescript";

import { namedImport, namespaceImport } from "./ast-imports.js";

export interface ClientPreambleInput {
  defaultBaseUrl: string;
  typeNamespace: string;
  hasTypes: boolean;
}

export function clientPreambleStatements(
  input: ClientPreambleInput,
): ts.Statement[] {
  return [
    namespaceImport("http", "k6/http"),
    namedImport(
      [
        { name: "applyMiddlewareHeaders" },
        { name: "buildQuery" },
        { name: "getBaseUrl" },
        { name: "mergeTags" },
        { name: "parseJson" },
      ],
      "@ahmedrowaihi/k6/runtime",
    ),
    ...(input.hasTypes
      ? [
          namespaceImport(input.typeNamespace, "./types.js", {
            typeOnly: true,
          }),
        ]
      : []),
    defaultBaseUrlConst(input.defaultBaseUrl).toAst() as ts.Statement,
    callOptsTypeAlias().toAst() as ts.Statement,
  ];
}

function defaultBaseUrlConst(value: string) {
  return $.const("DEFAULT_BASE_URL")
    .type($.type("string"))
    .assign($.literal(value));
}

function callOptsTypeAlias() {
  return $.type
    .alias("CallOpts")
    .export()
    .type(
      $.type
        .object()
        .prop("headers", (p) =>
          p
            .type(
              $.type("Record")
                .generic($.type("string"))
                .generic($.type("string")),
            )
            .optional(),
        )
        .prop("tags", (p) =>
          p
            .type(
              $.type("Record")
                .generic($.type("string"))
                .generic($.type("string")),
            )
            .optional(),
        ),
    );
}
