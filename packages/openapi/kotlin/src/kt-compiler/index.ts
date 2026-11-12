import { kt } from "@ir-kit/compiler-kotlin";

import type {
  KtAnnotation,
  KtDecl,
  KtProp,
  KtSealedSubclass,
} from "../kt-dsl/decl/index.js";
import type { KtExpr, KtLambdaExpr } from "../kt-dsl/expr/index.js";
import type { KtFile } from "../kt-dsl/file.js";
import type { KtFun, KtFunParam } from "../kt-dsl/fun.js";
import type { KtStmt } from "../kt-dsl/stmt/index.js";
import type { KtType } from "../kt-dsl/type/index.js";
import type { KtVisibility } from "../kt-dsl/visibility.js";

const f = kt.factory;
const printer = kt.createPrinter({ indentSize: 4 });

const SIMPLE_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Raw source fragments (defaults, annotation args) print verbatim. */
const raw = (text: string): kt.Expression => f.createIdentifier(text);

export function lowerType(t: KtType): kt.Type {
  switch (t.kind) {
    case "primitive":
      return f.createUserType(t.name);
    case "list":
      return f.createUserType("List", [lowerType(t.element)]);
    case "map":
      return f.createUserType("Map", [lowerType(t.key), lowerType(t.value)]);
    case "ref":
      return f.createUserType(t.name, t.args?.map(lowerType));
    case "nullable":
      return f.createNullableType(lowerType(t.inner));
    case "func":
      if (t.suspend) throw new Error("suspend function types are unsupported");
      return f.createFunctionType(
        t.params.map((p) => ({ type: lowerType(p) })),
        lowerType(t.returnType),
      );
  }
}

function lowerLambda(e: KtLambdaExpr) {
  return f.createLambdaExpression(
    e.body.map(lowerStmt),
    e.params.map((name) => ({ name })),
  );
}

export function lowerExpr(e: KtExpr): kt.Expression {
  switch (e.kind) {
    case "ident":
      return f.createIdentifier(e.name);
    case "this":
      return f.createThisExpression();
    case "str":
      return f.createStringLiteral([{ text: e.value }]);
    case "int":
      return f.createLiteral(String(e.value), "int");
    case "long":
      return f.createLiteral(`${e.value}L`, "long");
    case "double": {
      const s = String(e.value);
      return f.createLiteral(s.includes(".") ? s : `${s}.0`, "double");
    }
    case "bool":
      return f.createLiteral(String(e.value), "boolean");
    case "null":
      return f.createLiteral("null", "null");
    case "underscore":
      return f.createIdentifier("_");
    case "interp":
      return f.createStringLiteral(
        e.parts.map((p) => {
          if (typeof p === "string") return { text: p };
          const expr = lowerExpr(p);
          return p.kind === "ident" && !SIMPLE_IDENT.test(p.name)
            ? { expression: f.createParenthesizedExpression(expr) }
            : { expression: expr };
        }),
      );
    case "listLit":
      return f.createCallExpression(
        f.createIdentifier("listOf"),
        e.items.map((i) => ({ expression: lowerExpr(i) })),
      );
    case "mapLit":
      return f.createCallExpression(
        f.createIdentifier("mapOf"),
        e.pairs.map(([k, v]) => ({
          expression: f.createCallExpression(f.createIdentifier("Pair"), [
            { expression: lowerExpr(k) },
            { expression: lowerExpr(v) },
          ]),
        })),
      );
    case "member":
      return f.createNavigationExpression(
        lowerExpr(e.on),
        f.createIdentifier(e.name),
      );
    case "safeMember":
      return f.createNavigationExpression(
        lowerExpr(e.on),
        f.createIdentifier(e.name),
        true,
      );
    case "index":
      return f.createIndexingExpression(lowerExpr(e.on), [lowerExpr(e.index)]);
    case "notNull":
      return f.createPostfixUnaryExpression(lowerExpr(e.on), "!!");
    case "call":
      return f.createCallExpression(
        lowerExpr(e.callee),
        e.args.map((a) => ({ expression: lowerExpr(a.expr), name: a.label })),
        e.typeArgs?.map(lowerType),
        e.trailingLambda ? lowerLambda(e.trailingLambda) : undefined,
      );
    case "binOp":
      return e.op === "?:"
        ? f.createElvisExpression(lowerExpr(e.left), lowerExpr(e.right))
        : f.createBinaryExpression(lowerExpr(e.left), e.op, lowerExpr(e.right));
    case "lambda":
      return lowerLambda(e);
    case "range":
      return f.createBinaryExpression(
        lowerExpr(e.low),
        e.halfOpen ? "..<" : "..",
        lowerExpr(e.high),
      );
    case "cast":
      return f.createAsExpression(lowerExpr(e.expr), lowerType(e.type), e.safe);
    case "typeRef":
      return f.createCallableReference("class", raw(printType(e.type)));
  }
}

const block = (body: ReadonlyArray<KtStmt>) =>
  f.createBlock(body.map(lowerStmt));

export function lowerStmt(s: KtStmt): kt.Statement {
  switch (s.kind) {
    case "val":
    case "var":
      return f.createProperty(
        s.name,
        s.kind,
        s.type && lowerType(s.type),
        lowerExpr(s.expr),
      );
    case "assign":
      return f.createAssignment(lowerExpr(s.target), lowerExpr(s.value));
    case "expr":
      return f.createExpressionStatement(lowerExpr(s.expr));
    case "returnExpr":
      return f.createReturnStatement(lowerExpr(s.expr));
    case "return":
      return f.createReturnStatement(s.expr && lowerExpr(s.expr));
    case "throw":
      return f.createThrowStatement(lowerExpr(s.expr));
    case "if":
      return f.createIfStatement(
        lowerExpr(s.cond),
        block(s.then),
        s.else_ && block(s.else_),
      );
    case "when":
      return f.createWhenStatement(
        [
          ...s.cases.map((c) => ({
            conditions: c.patterns.map(lowerExpr),
            body: block(c.body),
          })),
          ...(s.default_ ? [{ body: block(s.default_) }] : []),
        ],
        s.on && lowerExpr(s.on),
      );
    case "forIn":
      return f.createForStatement([s.name], lowerExpr(s.source), block(s.body));
    case "tryCatch":
      return f.createTryExpression(
        block(s.body),
        s.catches.map((c) => ({
          parameter: f.createParameter(c.name, lowerType(c.type)),
          body: block(c.body),
        })),
      );
  }
}

const annotation = (a: KtAnnotation) =>
  f.createAnnotation(
    a.name,
    a.args === undefined ? undefined : [{ expression: raw(a.args) }],
  );

const superType = (name: string) => ({ type: f.createUserType(name) });

const isUnit = (t: KtType) => t.kind === "primitive" && t.name === "Unit";

function param(p: KtFunParam, withDefault: boolean) {
  return f.createParameter(
    p.name,
    lowerType(p.type),
    withDefault && p.default !== undefined ? raw(p.default) : undefined,
  );
}

function ctorProp(p: KtProp) {
  return f.createParameter(
    p.name,
    lowerType(p.type),
    p.default === undefined ? undefined : raw(p.default),
    p.mutable ? "var" : "val",
    [p.visibility],
    p.annotations.map(annotation),
  );
}

function bodyProp(p: KtProp) {
  return f.createProperty(
    p.name,
    p.mutable ? "var" : "val",
    lowerType(p.type),
    p.default === undefined ? undefined : raw(p.default),
    undefined,
    [p.visibility],
    p.annotations.map(annotation),
  );
}

function lowerFun(fn: KtFun, suppressVisibility = false) {
  const decl = f.createFunctionDeclaration(
    fn.name,
    fn.params.map((p) => param(p, fn.body !== undefined)),
    isUnit(fn.returnType) ? undefined : lowerType(fn.returnType),
    fn.body?.map(lowerStmt),
    undefined,
    suppressVisibility ? fn.modifiers : [fn.visibility, ...fn.modifiers],
    undefined,
    fn.receiver && lowerType(fn.receiver),
    fn.typeParams.length
      ? fn.typeParams.map((t) =>
          f.createTypeParameter(
            t.name,
            t.bounds?.map((b) => f.createUserType(b)),
          ),
        )
      : undefined,
  );
  return fn.doc
    ? {
        ...decl,
        leadingComments: fn.doc.split("\n").map((l) => `/** ${l} */`),
      }
    : decl;
}

function sealedSubclass(sc: KtSealedSubclass, parent: string) {
  const parentType = [{ type: f.createUserType(parent), arguments: [] }];
  const annotations = sc.annotations.map(annotation);
  return sc.variant === "object"
    ? f.createObjectDeclaration(
        sc.name,
        undefined,
        ["public"],
        annotations,
        parentType,
      )
    : f.createClassDeclaration(
        sc.name,
        f.createPrimaryConstructor(sc.properties.map(ctorProp)),
        undefined,
        ["public", "data"],
        annotations,
        parentType,
      );
}

const mods = (v: KtVisibility, ...rest: string[]) => [v, ...rest];

export function lowerDecl(d: KtDecl): kt.Declaration {
  switch (d.kind) {
    case "dataClass":
      return f.createClassDeclaration(
        d.name,
        f.createPrimaryConstructor(d.properties.map(ctorProp)),
        d.funs.map((fn) => lowerFun(fn)),
        mods(d.visibility, "data"),
        d.annotations.map(annotation),
        d.superTypes.map(superType),
      );
    case "class": {
      const ctor = [
        ...d.properties.filter((p) => p.inPrimary).map(ctorProp),
        ...d.ctorParams.map((p) => param(p, true)),
      ];
      return f.createClassDeclaration(
        d.name,
        ctor.length ? f.createPrimaryConstructor(ctor) : undefined,
        [
          ...d.properties.filter((p) => !p.inPrimary).map(bodyProp),
          ...(d.initBlock?.length
            ? [f.createInitBlock(d.initBlock.map(lowerStmt))]
            : []),
          ...d.funs.map((fn) => lowerFun(fn)),
        ],
        mods(d.visibility, ...d.modifiers),
        d.annotations.map(annotation),
        d.superTypes.map(superType),
      );
    }
    case "sealedClass":
      return f.createClassDeclaration(
        d.name,
        undefined,
        [
          ...d.subclasses.map((sc) => sealedSubclass(sc, d.name)),
          ...d.funs.map((fn) => lowerFun(fn)),
        ],
        mods(d.visibility, "sealed"),
        d.annotations.map(annotation),
        d.superTypes.map(superType),
      );
    case "object":
      return f.createObjectDeclaration(
        d.name,
        [...d.properties.map(bodyProp), ...d.funs.map((fn) => lowerFun(fn))],
        [d.visibility],
        d.annotations.map(annotation),
        d.superTypes.map(superType),
      );
    case "interface":
      return f.createClassDeclaration(
        d.name,
        undefined,
        d.funs.map((fn) => lowerFun(fn, true)),
        [d.visibility],
        d.annotations.map(annotation),
        d.superTypes.map(superType),
        undefined,
        true,
      );
    case "enum":
      return f.createClassDeclaration(
        d.name,
        d.properties.length
          ? f.createPrimaryConstructor(d.properties.map(ctorProp))
          : undefined,
        d.funs.map((fn) => lowerFun(fn)),
        mods(d.visibility, "enum"),
        d.annotations.map(annotation),
        d.superTypes.map(superType),
        d.entries.map((e) =>
          f.createEnumEntry(
            e.name,
            e.args === undefined ? undefined : [{ expression: raw(e.args) }],
            undefined,
            e.annotations?.map(annotation),
          ),
        ),
      );
    case "typeAlias":
      return f.createTypeAlias(d.name, lowerType(d.type), [d.visibility]);
    case "topLevelFun":
      return lowerFun(d.fun);
  }
}

const trimEnd = (s: string) => s.replace(/\n+$/, "");

export function printFile(file: KtFile): string {
  return printer.printFile(
    f.createSourceFile(
      file.decls.map(lowerDecl),
      file.pkg ? f.createPackageHeader(file.pkg) : undefined,
      file.imports.map((i) => f.createImportDirective(i)),
    ),
  );
}

export const printDecl = (d: KtDecl): string =>
  trimEnd(printer.printFile(lowerDecl(d)));

export const printType = (t: KtType): string =>
  trimEnd(printer.printFile(lowerType(t)));

export const printExpr = (e: KtExpr): string =>
  trimEnd(printer.printFile(lowerExpr(e)));

export const printStmt = (s: KtStmt): string =>
  trimEnd(printer.printFile(lowerStmt(s)));
