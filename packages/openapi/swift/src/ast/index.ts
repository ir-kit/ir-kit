import { swift } from "@ir-kit/compiler-swift";

const f = swift.factory;
const K = swift.SwiftNodeKind;

export type SwType = swift.Type;
export type SwExpr = swift.Expression;
export type SwStmt = swift.Statement;
export type SwPattern = swift.Pattern;
export type SwCallArg = swift.CallArgument;
export type SwClosureExpr = swift.ClosureExpression;
export type SwSwitchCase = swift.SwitchCase;
export type SwFun = swift.FunctionDeclaration;
export type SwInit = swift.InitializerDeclaration;
export type SwProp = swift.VariableDeclaration;
export type SwEnumCase = swift.EnumCaseDeclaration;
export type SwAccess = "public" | "internal" | "private" | "fileprivate";
export type SwClassModifier = "final" | "open";
export type SwEffect = "async" | "throws";

const ACCESS: ReadonlySet<string> = new Set([
  "public",
  "internal",
  "private",
  "fileprivate",
]);

const PATTERN_KINDS: ReadonlySet<string> = new Set([
  K.EnumCasePattern,
  K.ExpressionPattern,
  K.IdentifierPattern,
  K.IsPattern,
  K.OptionalPattern,
  K.TuplePattern,
  K.ValueBindingPattern,
  K.WildcardPattern,
]);

const access = (a: SwAccess | undefined): string[] =>
  (a ?? "public") === "internal" ? [] : [a ?? "public"];

// Types

const named = (name: string): SwType => f.createIdentifierType(name);

export const swString: SwType = named("String");
export const swInt: SwType = named("Int");
export const swInt32: SwType = named("Int32");
export const swInt64: SwType = named("Int64");
export const swDouble: SwType = named("Double");
export const swFloat: SwType = named("Float");
export const swBool: SwType = named("Bool");
export const swData: SwType = named("Data");
export const swVoid: SwType = named("Void");
/** Any JSON value; the runtime `JSONValue` enum keeps models `Codable`. */
export const swJSONValue: SwType = named("JSONValue");

export const swOptional = (inner: SwType): SwType =>
  inner.kind === K.OptionalType ? inner : f.createOptionalType(inner);
export const swArray = (element: SwType): SwType => f.createArrayType(element);
export const swDict = (key: SwType, value: SwType): SwType =>
  f.createDictionaryType(key, value);
export const swRef = (name: string): SwType => named(name);
export const swTupleType = (items: ReadonlyArray<SwType>): SwType =>
  f.createTupleType(items.map((type) => ({ type })));
export const swFunc = (
  params: ReadonlyArray<SwType>,
  returnType: SwType,
  effects: ReadonlyArray<SwEffect> = [],
): SwType =>
  f.createFunctionType(
    params,
    returnType,
    effects.includes("async") || undefined,
    effects.includes("throws") || undefined,
  );

/** `Pet` for a named type; `undefined` for composites. */
export const typeName = (t: SwType): string | undefined =>
  t.kind === K.IdentifierType ? t.name : undefined;
export const isVoid = (t: SwType): boolean => typeName(t) === "Void";
export const tupleTypes = (t: SwType): ReadonlyArray<SwType> =>
  t.kind === K.TupleType ? t.elements.map((e) => e.type) : [];

// Expressions

export const swIdent = (name: string): SwExpr => f.createIdentifier(name);
/** Implicit member expression (`.form`). */
export const swDotCase = (name: string): SwExpr =>
  f.createImplicitMemberExpression(name);
export const swEnumPattern = (
  caseName: string,
  bindings: ReadonlyArray<string> = [],
): SwPattern =>
  f.createEnumCasePattern(
    caseName,
    bindings.length
      ? bindings.map((b) =>
          f.createValueBindingPattern("let", f.createIdentifierPattern(b)),
        )
      : undefined,
  );
export const swMember = (on: SwExpr, name: string): SwExpr =>
  f.createMemberAccessExpression(on, name);
export const swOptChain = (on: SwExpr, name: string): SwExpr =>
  f.createMemberAccessExpression(
    f.createPostfixOperatorExpression(on, "?"),
    name,
  );
export const swSubscript = (on: SwExpr, index: SwExpr): SwExpr =>
  f.createSubscriptExpression(on, [index]);

export const swStr = (value: string): SwExpr => f.createStringLiteral(value);
export const swIntLit = (value: number): SwExpr =>
  f.createIntegerLiteral(String(value));
export const swBoolLit = (value: boolean): SwExpr =>
  f.createBooleanLiteral(value);
export const swInterp = (parts: ReadonlyArray<string | SwExpr>): SwExpr =>
  f.createInterpolatedStringLiteral(
    parts.map((p) =>
      typeof p === "string" ? { content: p } : { expression: p },
    ),
  );
export const swArrayLit = (
  items: ReadonlyArray<SwExpr>,
  elementType?: SwType,
): SwExpr =>
  items.length === 0 && elementType
    ? f.createFunctionCallExpression(
        f.createTypeExpression(f.createArrayType(elementType)),
        [],
      )
    : f.createArrayLiteral(items);

export const swArg = (expression: SwExpr, label?: string): SwCallArg => ({
  expression,
  label,
});
export const swCall = (
  callee: SwExpr,
  args: ReadonlyArray<SwCallArg> = [],
  trailingClosure?: SwClosureExpr,
): SwExpr => {
  const call = f.createFunctionCallExpression(callee, args);
  return trailingClosure ? { ...call, trailingClosure } : call;
};
export const swClosure = (
  params: ReadonlyArray<string>,
  body: ReadonlyArray<SwStmt>,
): SwClosureExpr => f.createClosureExpression(params, body);

export const swTry = (expr: SwExpr): SwExpr => f.createTryExpression(expr);
export const swTryOpt = (expr: SwExpr): SwExpr =>
  f.createTryExpression(expr, "?");
export const swTryAwait = (expr: SwExpr): SwExpr =>
  f.createTryExpression(f.createAwaitExpression(expr));
export const swTuple = (items: ReadonlyArray<SwExpr>): SwExpr =>
  f.createTupleExpression(items.map((expression) => ({ expression })));
/** `T.self` */
export const swTypeRef = (type: SwType): SwExpr =>
  f.createMemberAccessExpression(f.createTypeExpression(type), "self");
export const swRange = (low: SwExpr, high: SwExpr): SwExpr =>
  f.createRangeExpression("..<", low, high);
/** `lhs ?? rhs` */
export const swCoalesce = (lhs: SwExpr, rhs: SwExpr): SwExpr =>
  f.createInfixOperatorExpression(lhs, "??", rhs);
export const swAsOpt = (expr: SwExpr, type: SwType): SwExpr =>
  f.createAsExpression(expr, type, "?");

// Statements

export type SwLetBinding = string | { names: ReadonlyArray<string> };
export const swTupleBinding = (names: ReadonlyArray<string>): SwLetBinding => ({
  names,
});

export const swLet = (
  binding: SwLetBinding,
  expr: SwExpr,
  type?: SwType,
): SwStmt =>
  f.createVariableDeclaration("let", [
    {
      pattern:
        typeof binding === "string" ? binding : `(${binding.names.join(", ")})`,
      initializer: expr,
      typeAnnotation: type,
    },
  ]);
export const swVar = (name: string, expr: SwExpr, type?: SwType): SwStmt =>
  f.createVariableDeclaration("var", [
    { pattern: name, initializer: expr, typeAnnotation: type },
  ]);
export const swAssign = (target: SwExpr, value: SwExpr): SwStmt =>
  f.createExpressionStatement(f.createAssignmentExpression(target, value));
export const swExprStmt = (expr: SwExpr): SwStmt =>
  f.createExpressionStatement(expr);
export const swReturn = (expr?: SwExpr): SwStmt =>
  f.createReturnStatement(expr);
export const swThrow = (expr: SwExpr): SwStmt => f.createThrowStatement(expr);

export const swIf = (
  cond: SwExpr,
  then: ReadonlyArray<SwStmt>,
  else_?: ReadonlyArray<SwStmt>,
): SwStmt => f.createIfStatement([cond], then, else_);
export const swIfLet = (
  name: string,
  source: SwExpr,
  then: ReadonlyArray<SwStmt>,
  else_?: ReadonlyArray<SwStmt>,
): SwStmt =>
  f.createIfStatement(
    [{ bindingSpecifier: "let", pattern: name, initializer: source }],
    then,
    else_,
  );
export const swGuardLet = (
  name: string,
  source: SwExpr,
  else_: ReadonlyArray<SwStmt>,
): SwStmt =>
  f.createGuardStatement(
    [{ bindingSpecifier: "let", pattern: name, initializer: source }],
    else_,
  );

const caseBody = (body: ReadonlyArray<SwStmt>): ReadonlyArray<SwStmt> =>
  body.length ? body : [f.createBreakStatement()];

const toPattern = (p: SwExpr | SwPattern): SwPattern =>
  PATTERN_KINDS.has(p.kind)
    ? (p as SwPattern)
    : f.createExpressionPattern(p as SwExpr);

export const swCase = (
  patterns: ReadonlyArray<SwExpr | SwPattern>,
  body: ReadonlyArray<SwStmt>,
): SwSwitchCase => ({
  caseItems: patterns.map(toPattern),
  statements: caseBody(body),
});
export const swSwitch = (
  on: SwExpr,
  cases: ReadonlyArray<SwSwitchCase>,
  default_?: ReadonlyArray<SwStmt>,
): SwStmt =>
  f.createSwitchStatement(
    on,
    default_ ? [...cases, { statements: caseBody(default_) }] : cases,
  );
export const swForIn = (
  name: string,
  source: SwExpr,
  body: ReadonlyArray<SwStmt>,
): SwStmt => f.createForInStatement(name, source, body);
/** A bare `do { … }` scope. */
export const swDo = (body: ReadonlyArray<SwStmt>): SwStmt =>
  f.createDoStatement(body, []);
export const swDoCatch = (
  body: ReadonlyArray<SwStmt>,
  catch_: ReadonlyArray<SwStmt>,
): SwStmt => f.createDoStatement(body, [{ body: catch_ }]);

// Declarations

/** A function parameter as carried on operation signatures. */
export interface SwFunParam {
  name: string;
  type: SwType;
  /** Argument label; `"_"` for none, omitted when equal to `name`. */
  label?: string;
  default?: string;
}

export const swFunParam = (opts: SwFunParam): SwFunParam => ({ ...opts });

const parameter = (
  p: SwFunParam,
  withDefault: boolean,
): swift.FunctionParameter => ({
  firstName: p.label ?? p.name,
  secondName: p.label !== undefined && p.label !== p.name ? p.name : undefined,
  type: p.type,
  defaultValue:
    withDefault && p.default !== undefined
      ? f.createIdentifier(p.default)
      : undefined,
});

export interface SwGenericParam {
  name: string;
  conformances?: ReadonlyArray<string>;
}

export const swGenericParam = (
  name: string,
  conformances?: ReadonlyArray<string>,
): SwGenericParam => ({ name, conformances });

export function swFun(opts: {
  name: string;
  params: ReadonlyArray<SwFunParam>;
  returnType: SwType;
  effects?: ReadonlyArray<SwEffect>;
  body?: ReadonlyArray<SwStmt>;
  doc?: string;
  access?: SwAccess;
  isStatic?: boolean;
  isMutating?: boolean;
  generics?: ReadonlyArray<SwGenericParam>;
}): SwFun {
  const effects = opts.effects ?? [];
  const fn = f.createFunctionDeclaration(
    opts.name,
    opts.params.map((p) => parameter(p, opts.body !== undefined)),
    isVoid(opts.returnType) ? undefined : opts.returnType,
    opts.body,
    [
      ...access(opts.access),
      ...(opts.isStatic ? ["static"] : []),
      ...(opts.isMutating ? ["mutating"] : []),
    ],
    opts.generics?.length
      ? opts.generics.map((g) => ({
          name: g.name,
          inheritedType: g.conformances?.length
            ? g.conformances.length === 1
              ? named(g.conformances[0]!)
              : f.createCompositionType(g.conformances.map(named))
            : undefined,
        }))
      : undefined,
    effects.length
      ? {
          async: effects.includes("async") || undefined,
          throws: effects.includes("throws") || undefined,
        }
      : undefined,
  );
  return opts.doc
    ? { ...fn, leadingComments: opts.doc.split("\n").map((l) => `/// ${l}`) }
    : fn;
}

const withoutAccess = (fn: SwFun): SwFun => ({
  ...fn,
  modifiers: fn.modifiers?.filter((m) => !ACCESS.has(m)),
});

export function swProp(opts: {
  name: string;
  type: SwType;
  mutable?: boolean;
  default?: string;
  access?: SwAccess;
}): SwProp {
  return f.createVariableDeclaration(
    opts.mutable ? "var" : "let",
    [
      {
        pattern: opts.name,
        typeAnnotation: opts.type,
        initializer:
          opts.default === undefined
            ? undefined
            : f.createIdentifier(opts.default),
      },
    ],
    undefined,
    access(opts.access),
  );
}

/** Memberwise init: assigns each param to the same-named property. */
export function swInit(opts: {
  params: ReadonlyArray<SwFunParam>;
  body?: ReadonlyArray<SwStmt>;
  access?: SwAccess;
  memberwise?: boolean;
  throws?: boolean;
}): SwInit {
  const init = f.createInitializerDeclaration(
    opts.params.map((p) => parameter(p, true)),
    [
      ...(opts.memberwise === false
        ? []
        : opts.params.map((p) =>
            swAssign(
              swMember(f.createSelfExpression(), p.name),
              swIdent(p.name),
            ),
          )),
      ...(opts.body ?? []),
    ],
    false,
    access(opts.access),
  );
  return opts.throws ? { ...init, effectSpecifiers: { throws: true } } : init;
}

export interface SwEnumAssoc {
  type: SwType;
  label?: string;
}

export const swAssoc = (type: SwType, label?: string): SwEnumAssoc => ({
  type,
  label,
});

export function swEnumCase(
  name: string,
  rawValue?: string | number,
  assocs?: ReadonlyArray<SwEnumAssoc>,
): SwEnumCase {
  if (rawValue !== undefined && assocs?.length) {
    throw new Error(
      `Enum case "${name}" has both a raw value and associated values; Swift forbids this combination.`,
    );
  }
  return f.createEnumCaseDeclaration([
    {
      name,
      rawValue:
        rawValue === undefined
          ? undefined
          : typeof rawValue === "number"
            ? f.createIntegerLiteral(String(rawValue))
            : f.createStringLiteral(rawValue),
      parameterClause: assocs?.length
        ? assocs.map((a) =>
            a.label === undefined
              ? a.type
              : { firstName: a.label, type: a.type },
          )
        : undefined,
    },
  ]);
}

export interface SwCodingKeysEntry {
  swiftName: string;
  jsonKey: string;
}

/**
 * A top-level declaration plus the facts the project layer needs to
 * place it.
 */
export interface SwDecl {
  kind: "struct" | "enum" | "typeAlias" | "protocol" | "class" | "extension";
  name: string;
  /** Runtime-helper types live with the API surface. */
  runtime?: boolean;
  node: SwStmt;
}

export type SwStruct = SwDecl;
export type SwEnum = SwDecl;
export type SwClass = SwDecl;
export type SwProtocol = SwDecl;
export type SwExtension = SwDecl;
export type SwTypeAlias = SwDecl;

const inheritance = (
  names: ReadonlyArray<string> | undefined,
  first?: SwType,
): ReadonlyArray<SwType> | undefined => {
  const types = [...(first ? [first] : []), ...(names ?? []).map(named)];
  return types.length ? types : undefined;
};

export function swStruct(opts: {
  name: string;
  properties: ReadonlyArray<SwProp>;
  conforms?: ReadonlyArray<string>;
  access?: SwAccess;
  inits?: ReadonlyArray<SwInit>;
  codingKeys?: ReadonlyArray<SwCodingKeysEntry>;
}): SwStruct {
  const codingKeys = opts.codingKeys?.length
    ? [
        f.createEnumDeclaration(
          "CodingKeys",
          opts.codingKeys.map((e) =>
            f.createEnumCaseDeclaration([
              {
                name: e.swiftName,
                rawValue:
                  e.swiftName === e.jsonKey
                    ? undefined
                    : f.createStringLiteral(e.jsonKey),
              },
            ]),
          ),
          undefined,
          [named("String"), named("CodingKey")],
        ),
      ]
    : [];
  return {
    kind: "struct",
    name: opts.name,
    node: f.createStructDeclaration(
      opts.name,
      [...opts.properties, ...(opts.inits ?? []), ...codingKeys],
      access(opts.access),
      inheritance(opts.conforms),
    ),
  };
}

export function swEnum(opts: {
  name: string;
  cases: ReadonlyArray<SwEnumCase>;
  rawType?: SwType;
  conforms?: ReadonlyArray<string>;
  access?: SwAccess;
  inits?: ReadonlyArray<SwInit>;
  funs?: ReadonlyArray<SwFun>;
  runtime?: boolean;
}): SwEnum {
  return {
    kind: "enum",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createEnumDeclaration(
      opts.name,
      [...opts.cases, ...(opts.inits ?? []), ...(opts.funs ?? [])],
      access(opts.access),
      inheritance(opts.conforms, opts.rawType),
    ),
  };
}

export function swClass(opts: {
  name: string;
  conforms?: ReadonlyArray<string>;
  properties?: ReadonlyArray<SwProp>;
  inits?: ReadonlyArray<SwInit>;
  funs?: ReadonlyArray<SwFun>;
  modifiers?: ReadonlyArray<SwClassModifier>;
  access?: SwAccess;
  runtime?: boolean;
}): SwClass {
  return {
    kind: "class",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createClassDeclaration(
      opts.name,
      [...(opts.properties ?? []), ...(opts.inits ?? []), ...(opts.funs ?? [])],
      [...access(opts.access), ...(opts.modifiers ?? ["final"])],
      inheritance(opts.conforms),
    ),
  };
}

export function swProtocol(opts: {
  name: string;
  funs: ReadonlyArray<SwFun>;
  conforms?: ReadonlyArray<string>;
  access?: SwAccess;
}): SwProtocol {
  return {
    kind: "protocol",
    name: opts.name,
    node: f.createProtocolDeclaration(
      opts.name,
      opts.funs.map(withoutAccess),
      access(opts.access),
      inheritance(opts.conforms),
    ),
  };
}

export function swExtension(opts: {
  on: string;
  funs: ReadonlyArray<SwFun>;
  name?: string;
  access?: SwAccess;
  runtime?: boolean;
}): SwExtension {
  return {
    kind: "extension",
    name: opts.name ?? `${opts.on}+Defaults`,
    runtime: opts.runtime,
    // swift-format moves access off extensions onto their members.
    node: f.createExtensionDeclaration(
      named(opts.on),
      opts.funs.map((fn) => ({
        ...withoutAccess(fn),
        modifiers: [
          ...access(opts.access),
          ...(withoutAccess(fn).modifiers ?? []),
        ],
      })),
    ),
  };
}

export function swTypeAlias(opts: {
  name: string;
  type: SwType;
  access?: SwAccess;
}): SwTypeAlias {
  return {
    kind: "typeAlias",
    name: opts.name,
    node: f.createTypeAliasDeclaration(
      opts.name,
      opts.type,
      access(opts.access),
    ),
  };
}

export interface SwFile {
  imports: ReadonlyArray<string>;
  conditionalImports: ReadonlyArray<string>;
  decls: ReadonlyArray<SwDecl>;
}

export const swFile = (opts: {
  decls: ReadonlyArray<SwDecl>;
  imports?: ReadonlyArray<string>;
  conditionalImports?: ReadonlyArray<string>;
}): SwFile => ({
  imports: opts.imports ?? [],
  conditionalImports: opts.conditionalImports ?? [],
  decls: opts.decls,
});
