/**
 * Thin, typed sugar over `@ir-kit/compiler-go`'s factory. Every builder
 * returns a real compiler-go AST node; there is no intermediate model.
 */
import { go } from "@ir-kit/compiler-go";

const f = go.factory;
const K = go.GoNodeKind;

export type GoType = go.Type;
export type GoExpr = go.Expression;
export type GoStmt = go.Statement;

const docLines = (doc: string | undefined) => doc?.split("\n");

function withDoc<T extends go.Node>(node: T, doc?: string): T {
  const lines = docLines(doc);
  return lines ? { ...node, leadingComments: lines } : node;
}

// ── types ────────────────────────────────────────────────────────────

const named = (name: string): GoType => f.createIdentifier(name);

export const goString: GoType = named("string");
export const goInt: GoType = named("int");
export const goInt32: GoType = named("int32");
export const goInt64: GoType = named("int64");
export const goFloat32: GoType = named("float32");
export const goFloat64: GoType = named("float64");
export const goBool: GoType = named("bool");
export const goByte: GoType = named("byte");
export const goAny: GoType = named("any");
export const goError: GoType = named("error");
export const goContext: GoType = named("context.Context");

export const goPtr = (inner: GoType): GoType =>
  inner.kind === K.PointerType ? inner : f.createPointerType(inner);
export const goSlice = (element: GoType): GoType => f.createArrayType(element);
export const goBytes = (): GoType => goSlice(goByte);
export const goMap = (key: GoType, value: GoType): GoType =>
  f.createMapType(key, value);
export const goRef = (
  name: string,
  typeParams?: ReadonlyArray<GoType>,
): GoType =>
  typeParams?.length
    ? f.createGenericType(named(name), typeParams)
    : named(name);

export const isPtr = (t: GoType): boolean => t.kind === K.PointerType;
/** `*T` → `T`; anything else unchanged. */
export const unwrapPtr = (t: GoType): GoType =>
  t.kind === K.PointerType ? t.elementType : t;
const BUILTINS = new Set([
  "any",
  "bool",
  "byte",
  "context.Context",
  "error",
  "float32",
  "float64",
  "int",
  "int32",
  "int64",
  "rune",
  "string",
]);

/** A declared named type (`Pet`, `time.Time`, `Page[T]`), as opposed to
 *  a builtin or a composite. */
export const isNamed = (t: GoType): boolean =>
  t.kind === K.GenericType ||
  (t.kind === K.Identifier && !BUILTINS.has(t.name));
/** Types whose zero value is already `nil` (never pointer-wrapped). */
export const isNilable = (t: GoType): boolean =>
  t.kind === K.PointerType ||
  t.kind === K.MapType ||
  t.kind === K.InterfaceType ||
  (t.kind === K.ArrayType && t.size === undefined);

/** A type used in expression position (conversions, type args). */
export function goTypeExpr(t: GoType): GoExpr {
  if (t.kind === K.PointerType)
    return f.createUnaryExpression("*", goTypeExpr(t.elementType));
  return t as unknown as GoExpr;
}

// ── expressions ──────────────────────────────────────────────────────

export interface GoCallArg {
  expr: GoExpr;
  spread?: boolean;
}

export const goIdent = (name: string): GoExpr => f.createIdentifier(name);
export const goSelector = (on: GoExpr, name: string): GoExpr =>
  f.createMemberExpression(on, f.createIdentifier(name));
export const goIndex = (on: GoExpr, index: GoExpr): GoExpr =>
  f.createIndexExpression(on, index);

export function goCall(
  callee: GoExpr,
  args: ReadonlyArray<GoCallArg> = [],
  typeArgs?: ReadonlyArray<GoType>,
): GoExpr {
  if (typeArgs && typeArgs.length > 1)
    throw new Error("goCall: multiple type arguments not supported");
  const target = typeArgs?.length
    ? f.createIndexExpression(callee, goTypeExpr(typeArgs[0]!))
    : callee;
  return f.createCallExpression(
    target,
    args.map((a) => a.expr),
    args.at(-1)?.spread === true,
  );
}

export const goStr = (value: string, raw = false): GoExpr =>
  f.createLiteral(value, raw ? "rawString" : "string");
export const goIntLit = (value: number): GoExpr =>
  f.createLiteral(value, "int");
export const goBoolLit = (value: boolean): GoExpr =>
  f.createLiteral(value, "bool");
export const goNil: GoExpr = f.createLiteral(null, "nil");

export const goEq = (l: GoExpr, r: GoExpr): GoExpr =>
  f.createBinaryExpression(l, "==", r);
export const goNe = (l: GoExpr, r: GoExpr): GoExpr =>
  f.createBinaryExpression(l, "!=", r);
export const goAddr = (e: GoExpr): GoExpr => f.createUnaryExpression("&", e);
export const goDeref = (e: GoExpr): GoExpr => f.createUnaryExpression("*", e);

export const goStructLit = (
  type: GoType,
  fields: ReadonlyArray<{ name?: string; value: GoExpr }>,
): GoExpr =>
  f.createCompositeLiteral(
    fields.map((fl) =>
      fl.name
        ? f.createKeyValueExpression(f.createIdentifier(fl.name), fl.value)
        : fl.value,
    ),
    type,
  );
export const goSliceLit = (
  element: GoType,
  items: ReadonlyArray<GoExpr>,
): GoExpr => f.createCompositeLiteral(items, goSlice(element));

// ── statements ───────────────────────────────────────────────────────

export const goShort = (
  names: ReadonlyArray<string>,
  values: ReadonlyArray<GoExpr>,
): GoStmt => f.createShortVarDeclaration(names, values);
export const goVar = (name: string, type?: GoType, expr?: GoExpr): GoStmt =>
  f.createVariableStatement(
    undefined,
    f.createVariableDeclarationList(
      [f.createVariableDeclaration(name, type, expr)],
      go.NodeFlags.Var,
    ),
  );
export const goAssign = (
  targets: ReadonlyArray<GoExpr>,
  values: ReadonlyArray<GoExpr>,
): GoStmt => f.createAssignment(targets, values);
export const goExprStmt = (expr: GoExpr): GoStmt =>
  f.createExpressionStatement(expr);
export const goReturn = (values: ReadonlyArray<GoExpr> = []): GoStmt =>
  f.createReturnStatement([...values]);
export const goIf = (
  cond: GoExpr,
  then: ReadonlyArray<GoStmt>,
  opts: { init?: GoStmt; else_?: ReadonlyArray<GoStmt> } = {},
): GoStmt => f.createIfStatement(cond, then, opts.else_, opts.init);
export const goForRange = (
  vars: { key?: string; value?: string; assign?: boolean },
  source: GoExpr,
  body: ReadonlyArray<GoStmt>,
): GoStmt =>
  f.createForRangeStatement(
    source,
    body,
    vars.value !== undefined
      ? [vars.key ?? "_", vars.value]
      : vars.key !== undefined
        ? [vars.key]
        : [],
    !vars.assign,
  );

export interface GoSwitchCase {
  patterns: ReadonlyArray<GoExpr>;
  body: ReadonlyArray<GoStmt>;
}
export const goCase = (
  patterns: ReadonlyArray<GoExpr>,
  body: ReadonlyArray<GoStmt>,
): GoSwitchCase => ({ patterns, body });
export function goSwitch(
  tag: GoExpr | undefined,
  cases: ReadonlyArray<GoSwitchCase>,
  default_?: ReadonlyArray<GoStmt>,
): GoStmt {
  const out = cases.map((c) => f.createSwitchCase(c.body, c.patterns));
  if (default_) out.push(f.createSwitchCase(default_));
  return f.createSwitchStatement(out, tag);
}

// ── declarations ─────────────────────────────────────────────────────

/**
 * A top-level declaration plus what the project layer needs to place
 * it: its name, the file the emitter assigned (default `models.go`),
 * and for methods the receiver's type name.
 */
export interface GoDecl {
  kind: "struct" | "interface" | "func" | "typeAlias" | "constBlock";
  name: string;
  file?: string;
  receiver?: string;
  node: GoStmt;
}

export interface GoField {
  name: string;
  type: GoType;
  /** Struct tag body without backticks: `json:"id,omitempty"`. */
  tag?: string;
  doc?: string;
}
export const goField = (
  name: string,
  type: GoType,
  tag?: string,
  doc?: string,
): GoField => ({ name, type, tag, doc });

export function goStruct(opts: {
  name: string;
  fields: ReadonlyArray<GoField>;
  doc?: string;
}): GoDecl {
  const struct = f.createStructType(
    opts.fields.map((fl) => ({
      leadingComments: docLines(fl.doc),
      names: [fl.name],
      tag: fl.tag,
      type: fl.type,
    })),
  );
  return {
    kind: "struct",
    name: opts.name,
    node: withDoc(
      f.createTypeDeclaration([f.createTypeSpec(opts.name, struct)]),
      opts.doc,
    ),
  };
}

export interface GoFuncParam {
  name: string;
  type: GoType;
}
export interface GoFuncResult {
  name?: string;
  type: GoType;
}
export const goFuncParam = (name: string, type: GoType): GoFuncParam => ({
  name,
  type,
});
export const goFuncResult = (type: GoType, name?: string): GoFuncResult => ({
  name,
  type,
});

const params = (ps: ReadonlyArray<GoFuncParam>) =>
  ps.map((p) => f.createFunctionParameter([p.name], p.type));
const results = (rs: ReadonlyArray<GoFuncResult>) =>
  rs.map((r) => f.createFunctionReturn(r.type, r.name));

export interface GoMethodSignature {
  name: string;
  params: ReadonlyArray<GoFuncParam>;
  results: ReadonlyArray<GoFuncResult>;
  doc?: string;
}
export const goMethodSig = (
  name: string,
  ps: ReadonlyArray<GoFuncParam>,
  rs: ReadonlyArray<GoFuncResult>,
  doc?: string,
): GoMethodSignature => ({ name, params: ps, results: rs, doc });

export function goInterface(opts: {
  name: string;
  methods?: ReadonlyArray<GoMethodSignature>;
  embedded?: ReadonlyArray<string>;
  doc?: string;
}): GoDecl {
  const iface = f.createInterfaceType([
    ...(opts.embedded ?? []).map((e) => ({ embed: f.createIdentifier(e) })),
    ...(opts.methods ?? []).map((m) => ({
      leadingComments: docLines(m.doc),
      name: m.name,
      parameters: params(m.params),
      returnType: results(m.results),
    })),
  ]);
  return {
    kind: "interface",
    name: opts.name,
    node: withDoc(
      f.createTypeDeclaration([f.createTypeSpec(opts.name, iface)]),
      opts.doc,
    ),
  };
}

export interface GoFuncReceiver {
  name: string;
  type: GoType;
}
export const goReceiver = (name: string, type: GoType): GoFuncReceiver => ({
  name,
  type,
});

export function goFuncDecl(opts: {
  name: string;
  params?: ReadonlyArray<GoFuncParam>;
  results?: ReadonlyArray<GoFuncResult>;
  receiver?: GoFuncReceiver;
  body?: ReadonlyArray<GoStmt>;
  doc?: string;
}): GoDecl {
  const recvType = opts.receiver ? unwrapPtr(opts.receiver.type) : undefined;
  return {
    kind: "func",
    name: opts.name,
    receiver: recvType?.kind === K.Identifier ? recvType.name : undefined,
    node: f.createFunctionDeclaration(
      opts.receiver,
      opts.name,
      undefined,
      params(opts.params ?? []),
      results(opts.results ?? []),
      opts.body ?? [],
      docLines(opts.doc),
    ),
  };
}

export function goTypeAlias(opts: {
  name: string;
  type: GoType;
  alias?: boolean;
  doc?: string;
}): GoDecl {
  return {
    kind: "typeAlias",
    name: opts.name,
    node: withDoc(
      f.createTypeDeclaration([
        f.createTypeSpec(opts.name, opts.type, undefined, opts.alias ?? false),
      ]),
      opts.doc,
    ),
  };
}

export interface GoConstEntry {
  name: string;
  value?: GoExpr;
}
export const goConstEntry = (name: string, value?: GoExpr): GoConstEntry => ({
  name,
  value,
});

/** `const ( A T = …; B T = … )`. `name` identifies the block (the enum
 *  type it belongs to). */
export function goConstBlock(opts: {
  name: string;
  entries: ReadonlyArray<GoConstEntry>;
  type?: GoType;
  doc?: string;
}): GoDecl {
  return {
    kind: "constBlock",
    name: opts.name,
    node: withDoc(
      f.createVariableStatement(
        undefined,
        f.createVariableDeclarationList(
          opts.entries.map((e) =>
            f.createVariableDeclaration(
              e.name,
              opts.type && e.value !== undefined ? opts.type : undefined,
              e.value,
            ),
          ),
          go.NodeFlags.Const,
        ),
      ),
      opts.doc,
    ),
  };
}
