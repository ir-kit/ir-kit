import { java } from "@ir-kit/compiler-java";

const f: typeof java.factory = java.factory;

export type JType = java.Expression;
export type JExpr = java.Expression;
export type JStmt = java.Statement;
export type JParam = java.MethodParameter;
export type JMethod = java.MethodDeclaration;

export interface JDecl {
  kind: "record" | "class" | "interface" | "enum";
  name: string;
  /** API surface (client interface), placed beside its implementation. */
  api?: boolean;
  runtime?: boolean;
  node: JStmt;
}

/** Java has no type aliases: aliases are substituted away before printing. */
export interface JAlias {
  kind: "alias";
  name: string;
  target: JType;
}

export type JEmitted = JDecl | JAlias;

export interface JFile {
  pkg: string;
  imports: ReadonlyArray<string>;
  decl: JDecl;
}

const named = (name: string): JType => f.createIdentifier(name);

export const jString: JType = named("String");
export const jInteger: JType = named("Integer");
export const jLong: JType = named("Long");
export const jDouble: JType = named("Double");
export const jFloat: JType = named("Float");
export const jBoolean: JType = named("Boolean");
export const jObject: JType = named("Object");
export const jVoid: JType = named("Void");
export const jBytes: JType = f.createArrayType(named("byte"));

export const jRef = (name: string, args: ReadonlyArray<JType> = []): JType =>
  args.length ? f.createParameterizedType(named(name), args) : named(name);
export const jList = (element: JType): JType => jRef("List", [element]);
export const jMap = (value: JType): JType => jRef("Map", [jString, value]);

/** Simple names a type node mentions (for imports). */
export function typeNames(t: JType, out: Set<string> = new Set()): Set<string> {
  walk(t, (node) => {
    if (node.kind === java.JavaNodeKind.Identifier) out.add(node.name);
  });
  return out;
}

/** Depth-first walk over every object-valued child of a node. */
export function walk(
  node: unknown,
  visit: (node: { kind: string; name: string }) => void,
): void {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (!node || typeof node !== "object") return;
  const n = node as Record<string, unknown>;
  if (typeof n.kind === "string") visit(n as { kind: string; name: string });
  for (const value of Object.values(n)) walk(value, visit);
}

export const isVoid = (t: JType): boolean =>
  t.kind === java.JavaNodeKind.Identifier && t.name === "Void";

export const jIdent = (name: string): JExpr => f.createIdentifier(name);
export const jLit = (value: string | number | boolean | null): JExpr =>
  f.createLiteral(value);
export const jMember = (target: JExpr, name: string): JExpr =>
  f.createMemberExpression(target, f.createIdentifier(name));
export const jCall = (callee: JExpr, args: ReadonlyArray<JExpr> = []): JExpr =>
  f.createCallExpression(callee, args);
export const jMethodCall = (
  target: JExpr,
  name: string,
  args: ReadonlyArray<JExpr> = [],
): JExpr => jCall(jMember(target, name), args);
export const jNew = (type: JType, args: ReadonlyArray<JExpr> = []): JExpr =>
  f.createNewExpression(type, args);
export const jNewAnon = (
  type: JType,
  members: ReadonlyArray<JStmt> = [],
): JExpr => f.createNewExpression(type, [], members);
export const jBinary = (left: JExpr, op: string, right: JExpr): JExpr =>
  f.createBinaryExpression(left, op as never, right);
export const jTernary = (cond: JExpr, a: JExpr, b: JExpr): JExpr =>
  f.createTernaryExpression(cond, a, b);
export const jLambda = (
  params: ReadonlyArray<string>,
  body: ReadonlyArray<JStmt> | JExpr,
): JExpr =>
  f.createLambdaExpression(
    params.map((name) => ({ name })),
    body,
  );

export const jLocal = (name: string, value: JExpr, type?: JType): JStmt =>
  f.createVariableDeclaration(name, type ?? named("var"), value);
export const jAssign = (target: JExpr, value: JExpr): JStmt =>
  f.createAssignment(target, value);
export const jExprStmt = (expr: JExpr): JStmt =>
  f.createExpressionStatement(expr);
export const jReturn = (expr?: JExpr): JStmt => f.createReturnStatement(expr);
export const jIf = (
  cond: JExpr,
  then: ReadonlyArray<JStmt>,
  otherwise?: ReadonlyArray<JStmt>,
): JStmt => f.createIfStatement(cond, then, otherwise);
export const jForEach = (
  name: string,
  iterable: JExpr,
  body: ReadonlyArray<JStmt>,
  type?: JType,
): JStmt =>
  f.createEnhancedForStatement(name, iterable, body, type ?? named("var"));
export const jThrow = (expr: JExpr): JStmt => f.createThrowStatement(expr);

export function jParam(name: string, type: JType): JParam {
  return f.createMethodParameter(name, type);
}

export function jMethod(opts: {
  name: string;
  params: ReadonlyArray<JParam>;
  returnType?: JType;
  body?: ReadonlyArray<JStmt>;
  modifiers?: ReadonlyArray<string>;
  annotations?: ReadonlyArray<JExpr>;
  doc?: string;
}): JMethod {
  return f.createMethodDeclaration(
    opts.name,
    opts.params,
    opts.returnType && isVoid(opts.returnType)
      ? named("void")
      : opts.returnType,
    opts.body ?? [],
    opts.modifiers,
    opts.annotations,
    undefined,
    undefined,
    undefined,
    opts.doc?.split("\n"),
  ) as JMethod;
}

export const jAnnotation = (
  name: string,
  args: ReadonlyArray<JExpr> = [],
): JExpr => f.createAnnotation(named(name), args);

export function jRecord(opts: {
  name: string;
  components: ReadonlyArray<JParam>;
  members?: ReadonlyArray<JMethod>;
  annotations?: ReadonlyArray<JExpr>;
  implements?: ReadonlyArray<string>;
  runtime?: boolean;
}): JDecl {
  return {
    kind: "record",
    name: opts.name,
    runtime: opts.runtime,
    node: f.createRecordDeclaration(
      opts.name,
      opts.components,
      opts.members ?? [],
      ["public"],
      opts.annotations,
      opts.implements?.map(named),
    ),
  };
}

export function jInterface(opts: {
  name: string;
  methods: ReadonlyArray<JMethod>;
  api?: boolean;
  /** Makes the interface `sealed`, permitting exactly these subtypes. */
  permits?: ReadonlyArray<string>;
}): JDecl {
  const permits = opts.permits?.length
    ? opts.permits.map((p) => named(p))
    : undefined;
  return {
    kind: "interface",
    name: opts.name,
    api: opts.api,
    node: f.createInterfaceDeclaration(
      opts.name,
      opts.methods,
      permits ? ["public", "sealed"] : ["public"],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      permits,
    ),
  };
}

/** `Type<>` for constructor calls that infer their type arguments. */
export const jDiamond = (name: string): JType =>
  f.createParameterizedType(named(name), []);

export function jClass(opts: {
  name: string;
  members: ReadonlyArray<JStmt>;
  implements?: ReadonlyArray<string>;
  modifiers?: ReadonlyArray<string>;
}): JDecl {
  return {
    kind: "class",
    name: opts.name,
    node: f.createClassDeclaration(
      opts.name,
      opts.members as never,
      ["public", ...(opts.modifiers ?? [])],
      undefined,
      undefined,
      opts.implements?.map(named),
    ),
  };
}

export const jField = (
  name: string,
  type: JType,
  modifiers: ReadonlyArray<string> = ["private", "final"],
  value?: JExpr,
): JStmt => f.createVariableDeclaration(name, type, value, modifiers as never);

/** String enum carrying its wire value via `@JsonValue`. */
export function jValueEnum(
  name: string,
  entries: ReadonlyArray<{ identifier: string; value: JExpr }>,
  valueType: JType = jString,
): JDecl {
  return {
    kind: "enum",
    name,
    node: f.createEnumDeclaration(
      name,
      entries.map(({ identifier, value }) => ({
        name: identifier,
        args: [value],
      })),
      [
        jField("value", valueType) as never,
        f.createMethodDeclaration(
          name,
          [jParam("value", valueType)],
          undefined,
          [
            jAssign(
              jMember(f.createThisExpression(), "value"),
              jIdent("value"),
            ),
          ],
        ),
        jMethod({
          name: "value",
          params: [],
          returnType: valueType,
          modifiers: ["public"],
          annotations: [jAnnotation("JsonValue")],
          body: [jReturn(jIdent("value"))],
        }),
      ],
      ["public"],
    ),
  };
}
