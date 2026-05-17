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
    ...helperStatements(),
  );

  return stmts;
}

/**
 * Centralized per-request wiring. Each generated op is a one-line wrapper
 * around `call<T>` / `callAsync<T>` / `buildSpec`. Living here (one source of
 * truth) keeps the per-op output short and ensures any change to the request
 * shape lands in one place. Built with `ts.factory` per the codebase
 * convention — no template strings for emitted source.
 */
function helperStatements(): ts.Statement[] {
  return [requestSpecTypeAlias(), buildSpecFn(), callFn(false), callFn(true)];
}

/** `type RequestSpec = { method: string; url: string; body: string | null; params: Record<string, unknown>; };` */
function requestSpecTypeAlias(): ts.Statement {
  const stringT = f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  const bodyT = f.createUnionTypeNode([
    stringT,
    f.createLiteralTypeNode(f.createNull()),
  ]);
  const paramsT = f.createTypeReferenceNode("Record", [
    stringT,
    f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
  ]);
  return f.createTypeAliasDeclaration(
    undefined,
    "RequestSpec",
    undefined,
    f.createTypeLiteralNode([
      sig("method", stringT),
      sig("url", stringT),
      sig("body", bodyT),
      sig("params", paramsT),
    ]),
  );
}

/**
 * ```ts
 * function buildSpec(method, url, opId, body, opts?): RequestSpec {
 *   const contentType: Record<string, string> =
 *     body !== null ? { "Content-Type": "application/json" } : {};
 *   return {
 *     method, url, body,
 *     params: {
 *       ...applyMiddlewareParams(),
 *       ...opts,
 *       headers: applyMiddlewareHeaders({ ...contentType, ...opts?.headers }),
 *       tags: mergeTags(opId, opts?.tags),
 *     },
 *   };
 * }
 * ```
 */
function buildSpecFn(): ts.Statement {
  const stringT = f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  const stringRecord = f.createTypeReferenceNode("Record", [stringT, stringT]);

  // body !== null ? { "Content-Type": "application/json" } : {}
  const contentTypeTernary = f.createConditionalExpression(
    f.createBinaryExpression(
      f.createIdentifier("body"),
      f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
      f.createNull(),
    ),
    f.createToken(ts.SyntaxKind.QuestionToken),
    f.createObjectLiteralExpression([
      f.createPropertyAssignment(
        f.createStringLiteral("Content-Type"),
        f.createStringLiteral("application/json"),
      ),
    ]),
    f.createToken(ts.SyntaxKind.ColonToken),
    f.createObjectLiteralExpression([]),
  );

  const contentTypeDecl = constDecl(
    "contentType",
    contentTypeTernary,
    stringRecord,
  );

  // headers: applyMiddlewareHeaders({ ...contentType, ...opts?.headers })
  const headersValue = f.createCallExpression(
    f.createIdentifier("applyMiddlewareHeaders"),
    undefined,
    [
      f.createObjectLiteralExpression(
        [
          f.createSpreadAssignment(f.createIdentifier("contentType")),
          f.createSpreadAssignment(optsHeaders()),
        ],
        false,
      ),
    ],
  );

  // tags: mergeTags(opId, opts?.tags)
  const tagsValue = f.createCallExpression(
    f.createIdentifier("mergeTags"),
    undefined,
    [f.createIdentifier("opId"), optsTags()],
  );

  // { ...applyMiddlewareParams(), ...opts, headers, tags }
  const paramsObj = f.createObjectLiteralExpression(
    [
      f.createSpreadAssignment(
        f.createCallExpression(
          f.createIdentifier("applyMiddlewareParams"),
          undefined,
          [],
        ),
      ),
      f.createSpreadAssignment(f.createIdentifier("opts")),
      f.createPropertyAssignment("headers", headersValue),
      f.createPropertyAssignment("tags", tagsValue),
    ],
    true,
  );

  // { method, url, body, params }
  const returnObj = f.createObjectLiteralExpression(
    [
      f.createShorthandPropertyAssignment("method"),
      f.createShorthandPropertyAssignment("url"),
      f.createShorthandPropertyAssignment("body"),
      f.createPropertyAssignment("params", paramsObj),
    ],
    true,
  );

  return f.createFunctionDeclaration(
    undefined,
    undefined,
    "buildSpec",
    undefined,
    callHelperParams(),
    f.createTypeReferenceNode("RequestSpec"),
    f.createBlock([contentTypeDecl, f.createReturnStatement(returnObj)], true),
  );
}

/**
 * ```ts
 * function call<T>(method, url, opId, body, opts?): T { ... return parseJson(http.request(...)) as T; }
 * async function callAsync<T>(method, url, opId, body, opts?): Promise<T> { ... }
 * ```
 */
function callFn(asyncCall: boolean): ts.Statement {
  const tRef = f.createTypeReferenceNode("T");
  const returnType = asyncCall
    ? f.createTypeReferenceNode("Promise", [tRef])
    : tRef;
  const modifiers = asyncCall
    ? [f.createModifier(ts.SyntaxKind.AsyncKeyword)]
    : [];

  // const spec = buildSpec(method, url, opId, body, opts);
  const specDecl = constDecl(
    "spec",
    f.createCallExpression(f.createIdentifier("buildSpec"), undefined, [
      f.createIdentifier("method"),
      f.createIdentifier("url"),
      f.createIdentifier("opId"),
      f.createIdentifier("body"),
      f.createIdentifier("opts"),
    ]),
  );

  // http.<request|asyncRequest>(spec.method, spec.url, spec.body, spec.params)
  const httpCall = f.createCallExpression(
    f.createPropertyAccessExpression(
      f.createIdentifier("http"),
      f.createIdentifier(asyncCall ? "asyncRequest" : "request"),
    ),
    undefined,
    [specProp("method"), specProp("url"), specProp("body"), specProp("params")],
  );

  const body: ts.Statement[] = [specDecl];
  let parseSource: ts.Expression = httpCall;

  if (asyncCall) {
    // const res = await http.asyncRequest(...);
    body.push(constDecl("res", f.createAwaitExpression(httpCall)));
    parseSource = f.createIdentifier("res");
  }

  // return parseJson(...) as T;
  body.push(
    f.createReturnStatement(
      f.createAsExpression(
        f.createCallExpression(f.createIdentifier("parseJson"), undefined, [
          parseSource,
        ]),
        tRef,
      ),
    ),
  );

  return f.createFunctionDeclaration(
    modifiers,
    undefined,
    asyncCall ? "callAsync" : "call",
    [f.createTypeParameterDeclaration(undefined, "T")],
    callHelperParams(),
    returnType,
    f.createBlock(body, true),
  );
}

/** Parameter list shared by `buildSpec` / `call` / `callAsync`. */
function callHelperParams(): ts.ParameterDeclaration[] {
  const stringT = f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  const bodyT = f.createUnionTypeNode([
    stringT,
    f.createLiteralTypeNode(f.createNull()),
  ]);
  return [
    paramDecl("method", stringT),
    paramDecl("url", stringT),
    paramDecl("opId", stringT),
    paramDecl("body", bodyT),
    paramDecl("opts", f.createTypeReferenceNode("CallOpts"), true),
  ];
}

// === small factory helpers ===

/** `name<?:> type;` inside a TypeLiteralNode. */
function sig(name: string, type: ts.TypeNode): ts.PropertySignature {
  return f.createPropertySignature(undefined, name, undefined, type);
}

/** Function/arrow parameter — optional via the question token. */
function paramDecl(
  name: string,
  type: ts.TypeNode,
  optional = false,
): ts.ParameterDeclaration {
  return f.createParameterDeclaration(
    undefined,
    undefined,
    name,
    optional ? f.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    type,
  );
}

/** `const <name>[: <type>] = <init>;` */
function constDecl(
  name: string,
  init: ts.Expression,
  type?: ts.TypeNode,
): ts.Statement {
  return f.createVariableStatement(
    undefined,
    f.createVariableDeclarationList(
      [f.createVariableDeclaration(name, undefined, type, init)],
      ts.NodeFlags.Const,
    ),
  );
}

/** `spec.<name>` */
function specProp(name: string): ts.Expression {
  return f.createPropertyAccessExpression(f.createIdentifier("spec"), name);
}

/** `opts?.headers` */
function optsHeaders(): ts.Expression {
  return f.createPropertyAccessChain(
    f.createIdentifier("opts"),
    f.createToken(ts.SyntaxKind.QuestionDotToken),
    f.createIdentifier("headers"),
  );
}

/** `opts?.tags` */
function optsTags(): ts.Expression {
  return f.createPropertyAccessChain(
    f.createIdentifier("opts"),
    f.createToken(ts.SyntaxKind.QuestionDotToken),
    f.createIdentifier("tags"),
  );
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
