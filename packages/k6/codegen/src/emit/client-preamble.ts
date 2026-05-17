import { $ } from "@hey-api/openapi-ts";
import ts from "typescript";

import { defaultImport, namedImport, namespaceImport } from "./ast-imports.js";

const f = ts.factory;

export interface ClientPreambleInput {
  defaultBaseUrl: string;
  typeNamespace: string;
  hasTypes: boolean;
}

export function clientPreambleStatements(
  input: ClientPreambleInput,
): ts.Statement[] {
  const stmts: ts.Statement[] = [
    namespaceImport("http", "k6/http"),
    namedImport(
      [{ name: "check" }, { name: "group" }, { name: "sleep" }],
      "k6",
    ),
    namedImport(
      [
        { name: "Counter" },
        { name: "Gauge" },
        { name: "Rate" },
        { name: "Trend" },
      ],
      "k6/metrics",
    ),
    defaultImport("exec", "k6/execution"),
    namedImport(
      [
        { name: "applyMiddlewareHeaders" },
        { name: "applyMiddlewareParams" },
        { name: "buildQuery" },
        { name: "getBaseUrl" },
        { name: "installK6Bridge" },
        { name: "installMetricsFactory" },
        { name: "mergeTags" },
        { name: "parseJson" },
        { name: "setExecModule" },
      ],
      "@ahmedrowaihi/k6/runtime",
    ),
  ];

  if (input.hasTypes) {
    stmts.push(
      namespaceImport(input.typeNamespace, "./types.js", { typeOnly: true }),
    );
  }

  stmts.push(
    bridgeInstall(),
    execInstall(),
    metricsInstall(),
    defaultBaseUrlConst(input.defaultBaseUrl).toAst() as ts.Statement,
    callOptsTypeAlias(),
  );

  return stmts;
}

/** `installK6Bridge({ check, group, sleep });` */
function bridgeInstall(): ts.Statement {
  return f.createExpressionStatement(
    f.createCallExpression(f.createIdentifier("installK6Bridge"), undefined, [
      f.createObjectLiteralExpression(
        [
          f.createShorthandPropertyAssignment("check"),
          f.createShorthandPropertyAssignment("group"),
          f.createShorthandPropertyAssignment("sleep"),
        ],
        false,
      ),
    ]),
  );
}

/** `setExecModule(exec);` */
function execInstall(): ts.Statement {
  return f.createExpressionStatement(
    f.createCallExpression(f.createIdentifier("setExecModule"), undefined, [
      f.createIdentifier("exec"),
    ]),
  );
}

/**
 * Emit:
 * ```ts
 * installMetricsFactory((kind, name) =>
 *   new ({ counter: Counter, gauge: Gauge, rate: Rate, trend: Trend }[kind])(name)
 * );
 * ```
 */
function metricsInstall(): ts.Statement {
  const ctorMap = f.createObjectLiteralExpression(
    [
      f.createPropertyAssignment("counter", f.createIdentifier("Counter")),
      f.createPropertyAssignment("gauge", f.createIdentifier("Gauge")),
      f.createPropertyAssignment("rate", f.createIdentifier("Rate")),
      f.createPropertyAssignment("trend", f.createIdentifier("Trend")),
    ],
    false,
  );

  const ctorAccess = f.createElementAccessExpression(
    f.createParenthesizedExpression(ctorMap),
    f.createIdentifier("kind"),
  );

  const arrowBody = f.createNewExpression(
    f.createParenthesizedExpression(ctorAccess),
    undefined,
    [f.createIdentifier("name")],
  );

  const stringType = f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  const kindUnion = f.createUnionTypeNode([
    f.createLiteralTypeNode(f.createStringLiteral("counter")),
    f.createLiteralTypeNode(f.createStringLiteral("gauge")),
    f.createLiteralTypeNode(f.createStringLiteral("rate")),
    f.createLiteralTypeNode(f.createStringLiteral("trend")),
  ]);

  const arrow = f.createArrowFunction(
    undefined,
    undefined,
    [
      f.createParameterDeclaration(
        undefined,
        undefined,
        "kind",
        undefined,
        kindUnion,
        undefined,
      ),
      f.createParameterDeclaration(
        undefined,
        undefined,
        "name",
        undefined,
        stringType,
        undefined,
      ),
    ],
    undefined,
    undefined,
    arrowBody,
  );

  return f.createExpressionStatement(
    f.createCallExpression(
      f.createIdentifier("installMetricsFactory"),
      undefined,
      [arrow],
    ),
  );
}

function defaultBaseUrlConst(value: string) {
  return $.const("DEFAULT_BASE_URL")
    .type($.type("string"))
    .assign($.literal(value));
}

/**
 * `CallOpts` — per-request override. Headers/tags merged with middleware;
 * timeout/redirects/compression/responseType/responseCallback pass through
 * directly to k6's request params.
 */
function callOptsTypeAlias(): ts.Statement {
  const stringRecord = f.createTypeReferenceNode("Record", [
    f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
  ]);

  const responseTypeUnion = f.createUnionTypeNode([
    f.createLiteralTypeNode(f.createStringLiteral("text")),
    f.createLiteralTypeNode(f.createStringLiteral("binary")),
    f.createLiteralTypeNode(f.createStringLiteral("none")),
  ]);

  const timeoutUnion = f.createUnionTypeNode([
    f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    f.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  ]);

  return f.createTypeAliasDeclaration(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    "CallOpts",
    undefined,
    f.createTypeLiteralNode([
      optionalProp("headers", stringRecord),
      optionalProp("tags", stringRecord),
      optionalProp("timeout", timeoutUnion),
      optionalProp(
        "redirects",
        f.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
      ),
      optionalProp(
        "compression",
        f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      ),
      optionalProp("responseType", responseTypeUnion),
    ]),
  );
}

function optionalProp(name: string, type: ts.TypeNode): ts.PropertySignature {
  return f.createPropertySignature(
    undefined,
    name,
    f.createToken(ts.SyntaxKind.QuestionToken),
    type,
  );
}
