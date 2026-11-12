import { kt } from "@ir-kit/compiler-kotlin";

const f = kt.factory;
const K = kt.KotlinNodeKind;

export type KtType = kt.Type;
export type KtExpr = kt.Expression;
export type KtStmt = kt.Statement;
export type KtCallArg = kt.ValueArgument;
export type KtLambdaExpr = kt.LambdaExpression;
export type KtAnnotation = kt.Annotation;
export type KtEnumEntry = kt.EnumEntry;
export type KtFun = kt.FunctionDeclaration;
export type KtProp = kt.Property;
export type KtWhenCase = kt.WhenEntry;
export type KtCatchClause = kt.CatchClause;
export type KtSealedSubclass = kt.ClassDeclaration | kt.ObjectDeclaration;
export type KtVisibility = "public" | "internal" | "private" | "protected";
export type KtClassModifier = "open" | "abstract" | "final";
export type KtFunModifier = "override" | "open" | "abstract" | "suspend";

const VISIBILITIES: ReadonlySet<string> = new Set([
  "public",
  "internal",
  "private",
  "protected",
]);
const SIMPLE_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Verbatim source fragment (defaults, annotation args). */
const raw = (text: string): KtExpr => f.createIdentifier(text);

// Types

const named = (name: string): KtType => f.createUserType(name);

export const ktString: KtType = named("String");
export const ktInt: KtType = named("Int");
export const ktLong: KtType = named("Long");
export const ktShort: KtType = named("Short");
export const ktByte: KtType = named("Byte");
export const ktDouble: KtType = named("Double");
export const ktFloat: KtType = named("Float");
export const ktBoolean: KtType = named("Boolean");
export const ktUnit: KtType = named("Unit");
export const ktAny: KtType = named("Any");
export const ktNothing: KtType = named("Nothing");
export const ktByteArray: KtType = named("ByteArray");

export const ktNullable = (inner: KtType): KtType =>
  inner.kind === K.NullableType ? inner : f.createNullableType(inner);
export const ktList = (element: KtType): KtType =>
  f.createUserType("List", [element]);
export const ktMap = (key: KtType, value: KtType): KtType =>
  f.createUserType("Map", [key, value]);
export const ktRef = (name: string, args?: ReadonlyArray<KtType>): KtType =>
  f.createUserType(name, args?.length ? args : undefined);
export const ktFunc = (
  params: ReadonlyArray<KtType>,
  returnType: KtType,
): KtType =>
  f.createFunctionType(
    params.map((type) => ({ type })),
    returnType,
  );

/** `Pet` for `Pet` / `Pair<Pet, Response>`; `undefined` for composites. */
export const typeName = (t: KtType): string | undefined =>
  t.kind === K.UserType ? t.name : undefined;
export const typeArgs = (t: KtType): ReadonlyArray<KtType> =>
  t.kind === K.UserType ? (t.typeArguments ?? []) : [];
export const isUnit = (t: KtType): boolean => typeName(t) === "Unit";

// Expressions

export const ktIdent = (name: string): KtExpr => f.createIdentifier(name);
export const ktMember = (on: KtExpr, name: string): KtExpr =>
  f.createNavigationExpression(on, f.createIdentifier(name));
export const ktSafeMember = (on: KtExpr, name: string): KtExpr =>
  f.createNavigationExpression(on, f.createIdentifier(name), true);
export const ktIndex = (on: KtExpr, index: KtExpr): KtExpr =>
  f.createIndexingExpression(on, [index]);
export const ktNotNull = (on: KtExpr): KtExpr =>
  f.createPostfixUnaryExpression(on, "!!");
export const ktThis: KtExpr = f.createThisExpression();

export const ktStr = (value: string): KtExpr =>
  f.createStringLiteral([{ text: value }]);
export const ktIntLit = (value: number): KtExpr =>
  f.createLiteral(String(value), "int");
export const ktLongLit = (value: number): KtExpr =>
  f.createLiteral(`${value}L`, "long");
export const ktDoubleLit = (value: number): KtExpr => {
  const s = String(value);
  return f.createLiteral(s.includes(".") ? s : `${s}.0`, "double");
};
export const ktBoolLit = (value: boolean): KtExpr =>
  f.createLiteral(String(value), "boolean");
export const ktNull: KtExpr = f.createLiteral("null", "null");

export const ktInterp = (parts: ReadonlyArray<string | KtExpr>): KtExpr =>
  f.createStringLiteral(
    parts.map((p) => {
      if (typeof p === "string") return { text: p };
      const simple = p.kind !== K.Identifier || SIMPLE_IDENT.test(p.name);
      return {
        expression: simple ? p : f.createParenthesizedExpression(p),
      };
    }),
  );
export const ktListLit = (items: ReadonlyArray<KtExpr>): KtExpr =>
  ktCall(
    ktIdent("listOf"),
    items.map((i) => ktArg(i)),
  );

export const ktArg = (expression: KtExpr, name?: string): KtCallArg => ({
  expression,
  name,
});
export const ktCall = (
  callee: KtExpr,
  args: ReadonlyArray<KtCallArg> = [],
  trailingLambda?: KtLambdaExpr,
  typeArgs?: ReadonlyArray<KtType>,
): KtExpr =>
  f.createCallExpression(
    callee,
    args,
    typeArgs?.length ? typeArgs : undefined,
    trailingLambda,
  );
export const ktLambda = (
  params: ReadonlyArray<string>,
  body: ReadonlyArray<KtStmt>,
): KtLambdaExpr =>
  f.createLambdaExpression(
    body,
    params.map((name) => ({ name })),
  );

export const ktAs = (expr: KtExpr, type: KtType): KtExpr =>
  f.createAsExpression(expr, type);
export const ktAsSafe = (expr: KtExpr, type: KtType): KtExpr =>
  f.createAsExpression(expr, type, true);

type BinOp = "==" | "!=" | "<" | "<=" | ">" | ">=" | "&&" | "||" | "+";
export const ktBinOp = (op: BinOp, left: KtExpr, right: KtExpr): KtExpr =>
  f.createBinaryExpression(left, op, right);
export const ktEq = (l: KtExpr, r: KtExpr): KtExpr => ktBinOp("==", l, r);
export const ktNe = (l: KtExpr, r: KtExpr): KtExpr => ktBinOp("!=", l, r);
export const ktElvis = (l: KtExpr, r: KtExpr): KtExpr =>
  f.createElvisExpression(l, r);

// Statements

export const ktVal = (name: string, expr: KtExpr, type?: KtType): KtStmt =>
  f.createProperty(name, "val", type, expr);
export const ktVar = (name: string, expr: KtExpr, type?: KtType): KtStmt =>
  f.createProperty(name, "var", type, expr);
export const ktAssign = (target: KtExpr, value: KtExpr): KtStmt =>
  f.createAssignment(target, value);
export const ktExprStmt = (expr: KtExpr): KtStmt =>
  f.createExpressionStatement(expr);
export const ktReturn = (expr?: KtExpr): KtStmt =>
  f.createReturnStatement(expr);
export const ktThrow = (expr: KtExpr): KtStmt => f.createThrowStatement(expr);

const block = (body: ReadonlyArray<KtStmt>) => f.createBlock(body);

export const ktIf = (
  cond: KtExpr,
  then: ReadonlyArray<KtStmt>,
  else_?: ReadonlyArray<KtStmt>,
): KtStmt => f.createIfStatement(cond, block(then), else_ && block(else_));
export const ktWhenCase = (
  patterns: ReadonlyArray<KtExpr>,
  body: ReadonlyArray<KtStmt>,
): KtWhenCase => ({ conditions: patterns, body: block(body) });
export const ktWhen = (
  on: KtExpr | undefined,
  cases: ReadonlyArray<KtWhenCase>,
  default_?: ReadonlyArray<KtStmt>,
): KtStmt =>
  f.createWhenStatement(
    default_ ? [...cases, { body: block(default_) }] : cases,
    on,
  );
export const ktForIn = (
  name: string,
  source: KtExpr,
  body: ReadonlyArray<KtStmt>,
): KtStmt => f.createForStatement([name], source, block(body));
export const ktCatch = (
  name: string,
  type: KtType,
  body: ReadonlyArray<KtStmt>,
): KtCatchClause => ({
  parameter: f.createParameter(name, type),
  body: block(body),
});
export const ktTryCatch = (
  body: ReadonlyArray<KtStmt>,
  catches: ReadonlyArray<KtCatchClause>,
): KtStmt => f.createTryExpression(block(body), catches);

// Declarations

/** A function parameter as carried on operation signatures. */
export interface KtFunParam {
  name: string;
  type: KtType;
  default?: string;
}

export const ktFunParam = (opts: KtFunParam): KtFunParam => ({ ...opts });

export const ktAnnotation = (name: string, args?: string): KtAnnotation =>
  f.createAnnotation(name, args === undefined ? undefined : [ktArg(raw(args))]);

export function ktProp(opts: {
  name: string;
  type: KtType;
  mutable?: boolean;
  default?: string;
  visibility?: KtVisibility;
  annotations?: ReadonlyArray<KtAnnotation>;
}): KtProp {
  return f.createProperty(
    opts.name,
    opts.mutable ? "var" : "val",
    opts.type,
    opts.default === undefined ? undefined : raw(opts.default),
    undefined,
    [opts.visibility ?? "public"],
    opts.annotations,
  );
}

/** Properties of data/enum/impl classes live in the primary constructor. */
const primaryConstructor = (props: ReadonlyArray<KtProp>) =>
  f.createPrimaryConstructor(
    props.map((p) =>
      f.createParameter(
        p.name,
        p.type ?? ktAny,
        p.initializer,
        p.valOrVar,
        p.modifiers,
        p.annotations,
      ),
    ),
  );

const superTypes = (names: ReadonlyArray<string> | undefined) =>
  names?.map((name) => ({ type: f.createUserType(name) }));

export function ktFun(opts: {
  name: string;
  params: ReadonlyArray<KtFunParam>;
  returnType: KtType;
  modifiers?: ReadonlyArray<KtFunModifier>;
  body?: ReadonlyArray<KtStmt>;
  doc?: string;
  visibility?: KtVisibility;
  receiver?: KtType;
}): KtFun {
  const abstract = opts.body === undefined;
  const fn = f.createFunctionDeclaration(
    opts.name,
    opts.params.map((p) =>
      f.createParameter(
        p.name,
        p.type,
        abstract || p.default === undefined ? undefined : raw(p.default),
      ),
    ),
    isUnit(opts.returnType) ? undefined : opts.returnType,
    opts.body,
    undefined,
    [opts.visibility ?? "public", ...(opts.modifiers ?? [])],
    undefined,
    opts.receiver,
  );
  return opts.doc
    ? {
        ...fn,
        leadingComments: opts.doc.split("\n").map((l) => `/** ${l} */`),
      }
    : fn;
}

export const ktEnumEntry = (
  name: string,
  args?: string,
  annotations?: ReadonlyArray<KtAnnotation>,
): KtEnumEntry =>
  f.createEnumEntry(
    name,
    args === undefined ? undefined : [ktArg(raw(args))],
    undefined,
    annotations,
  );

export function ktSealedSubclass(opts: {
  variant: "class" | "object";
  name: string;
  properties?: ReadonlyArray<KtProp>;
  annotations?: ReadonlyArray<KtAnnotation>;
}): KtSealedSubclass {
  return opts.variant === "object"
    ? f.createObjectDeclaration(
        opts.name,
        undefined,
        ["public"],
        opts.annotations,
      )
    : f.createClassDeclaration(
        opts.name,
        primaryConstructor(opts.properties ?? []),
        undefined,
        ["public", "data"],
        opts.annotations,
      );
}

/**
 * A top-level declaration plus the facts the project layer needs to
 * place and import it.
 */
export interface KtDecl {
  kind:
    | "dataClass"
    | "class"
    | "sealedClass"
    | "object"
    | "interface"
    | "enum"
    | "typeAlias"
    | "topLevelFun";
  name: string;
  /** Runtime-helper types live with the API surface. */
  runtime?: boolean;
  /** Receiver type name of a top-level extension fun. */
  receiver?: string;
  node: kt.Declaration;
}

interface DeclOpts {
  name: string;
  annotations?: ReadonlyArray<KtAnnotation>;
  superTypes?: ReadonlyArray<string>;
  visibility?: KtVisibility;
  funs?: ReadonlyArray<KtFun>;
  runtime?: boolean;
}

export function ktDataClass(
  opts: DeclOpts & { properties: ReadonlyArray<KtProp> },
): KtDecl {
  return {
    kind: "dataClass",
    name: opts.name,
    runtime: opts.runtime,
    // A data class needs at least one constructor property.
    node: f.createClassDeclaration(
      opts.name,
      opts.properties.length ? primaryConstructor(opts.properties) : undefined,
      opts.funs,
      opts.properties.length
        ? [opts.visibility ?? "public", "data"]
        : [opts.visibility ?? "public"],
      opts.annotations,
      superTypes(opts.superTypes),
    ),
  };
}

export function ktClass(
  opts: DeclOpts & {
    properties?: ReadonlyArray<KtProp>;
    modifiers?: ReadonlyArray<KtClassModifier>;
  },
): KtDecl {
  return {
    kind: "class",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createClassDeclaration(
      opts.name,
      opts.properties?.length ? primaryConstructor(opts.properties) : undefined,
      opts.funs,
      [opts.visibility ?? "public", ...(opts.modifiers ?? [])],
      opts.annotations,
      superTypes(opts.superTypes),
    ),
  };
}

export function ktSealedClass(
  opts: DeclOpts & { subclasses: ReadonlyArray<KtSealedSubclass> },
): KtDecl {
  const parent = [{ type: f.createUserType(opts.name), arguments: [] }];
  return {
    kind: "sealedClass",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createClassDeclaration(
      opts.name,
      undefined,
      [
        ...opts.subclasses.map((sc) => ({ ...sc, superTypes: parent })),
        ...(opts.funs ?? []),
      ],
      [opts.visibility ?? "public", "sealed"],
      opts.annotations,
      superTypes(opts.superTypes),
    ),
  };
}

export function ktObject(
  opts: DeclOpts & { properties?: ReadonlyArray<KtProp> },
): KtDecl {
  return {
    kind: "object",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createObjectDeclaration(
      opts.name,
      [...(opts.properties ?? []), ...(opts.funs ?? [])],
      [opts.visibility ?? "public"],
      opts.annotations,
      superTypes(opts.superTypes),
    ),
  };
}

export function ktInterface(
  opts: DeclOpts & { funs: ReadonlyArray<KtFun> },
): KtDecl {
  return {
    kind: "interface",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createClassDeclaration(
      opts.name,
      undefined,
      opts.funs.map((fn) => ({
        ...fn,
        modifiers: fn.modifiers?.filter((m) => !VISIBILITIES.has(m)),
      })),
      [opts.visibility ?? "public"],
      opts.annotations,
      superTypes(opts.superTypes),
      undefined,
      true,
    ),
  };
}

export function ktEnum(
  opts: DeclOpts & {
    entries: ReadonlyArray<KtEnumEntry>;
    properties?: ReadonlyArray<KtProp>;
  },
): KtDecl {
  return {
    kind: "enum",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createClassDeclaration(
      opts.name,
      opts.properties?.length ? primaryConstructor(opts.properties) : undefined,
      opts.funs,
      [opts.visibility ?? "public", "enum"],
      opts.annotations,
      superTypes(opts.superTypes),
      opts.entries,
    ),
  };
}

export function ktTypeAlias(opts: {
  name: string;
  type: KtType;
  visibility?: KtVisibility;
}): KtDecl {
  return {
    kind: "typeAlias",
    name: opts.name,
    node: f.createTypeAlias(opts.name, opts.type, [
      opts.visibility ?? "public",
    ]),
  };
}

export const ktTopLevelFun = (fn: KtFun): KtDecl => ({
  kind: "topLevelFun",
  name: fn.name,
  receiver: fn.receiverType && typeName(fn.receiverType),
  node: fn,
});

export interface KtFile {
  pkg?: string;
  imports: ReadonlyArray<string>;
  decls: ReadonlyArray<KtDecl>;
}

export const ktFile = (opts: {
  decls: ReadonlyArray<KtDecl>;
  pkg?: string;
  imports?: ReadonlyArray<string>;
}): KtFile => ({
  pkg: opts.pkg,
  imports: opts.imports ?? [],
  decls: opts.decls,
});
