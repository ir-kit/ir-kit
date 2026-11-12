import { go } from "@ir-kit/compiler-go";

import type { GoDecl } from "../go-dsl/decl/types.js";
import type { GoExpr } from "../go-dsl/expr/types.js";
import type { GoFile } from "../go-dsl/file.js";
import type { GoControlStmt, GoStmt } from "../go-dsl/stmt/types.js";
import type { GoType } from "../go-dsl/type/types.js";
import { collectImports } from "./imports.js";

const f = go.factory;

type AstType = go.Type;
type AstExpr = go.Expression;
type AstStmt = go.Statement;

const docLines = (doc: string | undefined) => doc?.split("\n");

function withComments<T extends go.Node>(node: T, doc?: string): T {
  const lines = docLines(doc);
  return lines ? { ...node, leadingComments: lines } : node;
}

export function lowerType(t: GoType): AstType {
  switch (t.kind) {
    case "primitive":
      return f.createIdentifier(t.name);
    case "slice":
      return f.createArrayType(lowerType(t.element));
    case "map":
      return f.createMapType(lowerType(t.key), lowerType(t.value));
    case "ptr":
      return f.createPointerType(lowerType(t.inner));
    case "ref": {
      const id = f.createIdentifier(t.name);
      return t.typeParams?.length
        ? f.createGenericType(id, t.typeParams.map(lowerType))
        : id;
    }
    case "func":
      return f.createFunctionType(
        t.params.map((p) =>
          p.name
            ? (f.createFunctionParameter(
                [p.name],
                lowerType(p.type),
              ) as unknown as AstExpr)
            : (lowerType(p.type) as unknown as AstExpr),
        ),
        t.results.map((r) => f.createFunctionReturn(lowerType(r))),
      );
    case "interface":
      return f.createInterfaceType(
        t.methods.map((m) => {
          if (m.signature.kind !== "func")
            throw new Error(`interface method ${m.name}: expected func type`);
          return {
            name: m.name,
            parameters: m.signature.params.map((p) =>
              f.createFunctionParameter(
                p.name ? [p.name] : [],
                lowerType(p.type),
              ),
            ),
            returnType: m.signature.results.map((r) =>
              f.createFunctionReturn(lowerType(r)),
            ),
          };
        }),
      );
  }
}

/** Types appearing in expression position (conversions, type-switch
 *  cases, generic args). */
function typeAsExpr(t: GoType): AstExpr {
  if (t.kind === "ptr")
    return f.createUnaryExpression("*", typeAsExpr(t.inner));
  return lowerType(t) as unknown as AstExpr;
}

export function lowerExpr(e: GoExpr): AstExpr {
  switch (e.kind) {
    case "str":
      return f.createLiteral(e.value, e.raw ? "rawString" : "string");
    case "int":
      return f.createLiteral(e.value, "int");
    case "float":
      return f.createLiteral(e.value, "float");
    case "bool":
      return f.createLiteral(e.value, "bool");
    case "nil":
      return f.createLiteral(null, "nil");
    case "underscore":
      return f.createIdentifier("_");
    case "iota":
      return f.createIdentifier("iota");
    case "ident":
      return f.createIdentifier(e.name);
    case "selector":
      return f.createMemberExpression(
        lowerExpr(e.on),
        f.createIdentifier(e.name),
      );
    case "index":
      return f.createIndexExpression(lowerExpr(e.on), lowerExpr(e.index));
    case "call": {
      const callee = e.typeArgs?.length
        ? f.createIndexExpression(
            lowerExpr(e.callee),
            ...([typeAsExpr(e.typeArgs[0]!)] as [AstExpr]),
          )
        : lowerExpr(e.callee);
      if (e.typeArgs && e.typeArgs.length > 1)
        throw new Error("call: multiple type arguments not supported");
      const spread = e.args.at(-1)?.spread === true;
      return f.createCallExpression(
        callee,
        e.args.map((a) => lowerExpr(a.expr)),
        spread,
      );
    }
    case "funcLit":
      return f.createFunctionLiteral(
        e.params.map((p) =>
          f.createFunctionParameter([p.name], lowerType(p.type)),
        ),
        e.results.map((r) => f.createFunctionReturn(lowerType(r.type), r.name)),
        e.body.map(lowerStmt),
      );
    case "binOp":
      return f.createBinaryExpression(
        lowerExpr(e.left),
        e.op,
        lowerExpr(e.right),
      );
    case "unary":
      return f.createUnaryExpression(e.op, lowerExpr(e.operand));
    case "typeAssert":
      return f.createTypeAssertExpression(lowerExpr(e.expr), lowerType(e.type));
    case "structLit":
      return f.createCompositeLiteral(
        e.fields.map((fl) =>
          fl.name
            ? f.createKeyValueExpression(
                f.createIdentifier(fl.name),
                lowerExpr(fl.value),
              )
            : lowerExpr(fl.value),
        ),
        lowerType(e.type),
      );
    case "sliceLit":
      return f.createCompositeLiteral(
        e.items.map(lowerExpr),
        f.createArrayType(lowerType(e.element)),
      );
    case "mapLit":
      return f.createCompositeLiteral(
        e.pairs.map(([k, v]) =>
          f.createKeyValueExpression(lowerExpr(k), lowerExpr(v)),
        ),
        f.createMapType(lowerType(e.key), lowerType(e.value)),
      );
    case "typeRef":
      return typeAsExpr(e.type);
  }
}

function asCall(e: AstExpr, what: string): go.Node & { kind: go.NodeKind } {
  if (e.kind !== go.GoNodeKind.CallExpression)
    throw new Error(`${what}: expected a call expression`);
  return e;
}

const block = (stmts: ReadonlyArray<GoStmt>) => stmts.map(lowerStmt);

function lowerControl(s: GoControlStmt): AstStmt {
  switch (s.kind) {
    case "return":
      return f.createReturnStatement(s.values.map(lowerExpr));
    case "if": {
      const elseBlock = s.else_
        ? Array.isArray(s.else_)
          ? block(s.else_)
          : (lowerControl(
              (s.else_ as { stmt: GoControlStmt }).stmt,
            ) as ReturnType<typeof f.createIfStatement>)
        : undefined;
      return f.createIfStatement(
        lowerExpr(s.cond),
        block(s.then),
        elseBlock,
        s.init ? lowerStmt(s.init) : undefined,
      );
    }
    case "for":
      return f.createForStatement(
        s.init ? lowerStmt(s.init) : undefined,
        s.cond ? lowerExpr(s.cond) : undefined,
        s.post ? lowerStmt(s.post) : undefined,
        block(s.body),
      );
    case "forRange": {
      const targets =
        s.value !== undefined
          ? [s.key ?? "_", s.value]
          : s.key !== undefined
            ? [s.key]
            : [];
      return f.createForRangeStatement(
        lowerExpr(s.source),
        block(s.body),
        targets,
        !s.assign,
      );
    }
    case "switch": {
      const cases = s.cases.map((c) =>
        f.createSwitchCase(block(c.body), c.patterns.map(lowerExpr)),
      );
      if (s.default_) cases.push(f.createSwitchCase(block(s.default_)));
      return f.createSwitchStatement(
        cases,
        s.tag ? lowerExpr(s.tag) : undefined,
      );
    }
    case "typeSwitch": {
      const cases = s.cases.map((c) =>
        f.createSwitchCase(block(c.body), c.types.map(typeAsExpr)),
      );
      if (s.default_) cases.push(f.createSwitchCase(block(s.default_)));
      return f.createSwitchStatement(cases, undefined, undefined, {
        assignTo: s.bind,
        subject: lowerExpr(s.expr),
      });
    }
    case "break":
      return f.createBreakStatement();
    case "continue":
      return f.createContinueStatement();
  }
}

export function lowerStmt(s: GoStmt): AstStmt {
  switch (s.kind) {
    case "shortDecl":
      return f.createShortVarDeclaration(s.names, s.values.map(lowerExpr));
    case "var":
    case "const":
      return f.createVariableStatement(
        undefined,
        f.createVariableDeclarationList(
          [
            f.createVariableDeclaration(
              s.name,
              s.type ? lowerType(s.type) : undefined,
              s.expr ? lowerExpr(s.expr) : undefined,
            ),
          ],
          s.kind === "var" ? go.NodeFlags.Var : go.NodeFlags.Const,
        ),
      );
    case "assign":
      return f.createAssignment(
        s.targets.map(lowerExpr),
        s.values.map(lowerExpr),
      );
    case "expr":
      return f.createExpressionStatement(lowerExpr(s.expr));
    case "defer":
      return f.createDeferStatement(
        asCall(lowerExpr(s.expr), "defer") as Parameters<
          typeof f.createDeferStatement
        >[0],
      );
    case "go":
      return f.createGoStatement(
        asCall(lowerExpr(s.expr), "go") as Parameters<
          typeof f.createGoStatement
        >[0],
      );
    default:
      return lowerControl(s);
  }
}

const unquoteTag = (tag: string) => tag.replace(/^`|`$/g, "");

export function lowerDecl(d: GoDecl): AstStmt {
  switch (d.kind) {
    case "struct":
      return withComments(
        f.createTypeDeclaration([
          f.createTypeSpec(
            d.name,
            f.createStructType(
              d.fields.map((fl) => ({
                leadingComments: docLines(fl.doc),
                names: [fl.name],
                type: lowerType(fl.type),
                tag: fl.tag ? unquoteTag(fl.tag) : undefined,
              })),
            ),
          ),
        ]),
        d.doc,
      );
    case "interface":
      return withComments(
        f.createTypeDeclaration([
          f.createTypeSpec(
            d.name,
            f.createInterfaceType([
              ...d.embedded.map((e) => ({ embed: f.createIdentifier(e) })),
              ...d.methods.map((m) => ({
                leadingComments: docLines(m.doc),
                name: m.name,
                parameters: m.params.map((p) =>
                  f.createFunctionParameter([p.name], lowerType(p.type)),
                ),
                returnType: m.results.map((r) =>
                  f.createFunctionReturn(lowerType(r.type), r.name),
                ),
              })),
            ]),
          ),
        ]),
        d.doc,
      );
    case "func":
      return f.createFunctionDeclaration(
        d.receiver
          ? { name: d.receiver.name, type: lowerType(d.receiver.type) }
          : undefined,
        d.name,
        d.typeParams.length
          ? d.typeParams.map((tp) => ({
              names: [tp.name],
              constraint: f.createIdentifier(tp.constraint),
            }))
          : undefined,
        d.params.map((p) =>
          f.createFunctionParameter([p.name], lowerType(p.type)),
        ),
        d.results.map((r) => f.createFunctionReturn(lowerType(r.type), r.name)),
        d.body?.map(lowerStmt),
        docLines(d.doc),
      );
    case "typeAlias":
      return withComments(
        f.createTypeDeclaration([
          f.createTypeSpec(d.name, lowerType(d.type), undefined, d.alias),
        ]),
        d.doc,
      );
    case "constBlock":
      return withComments(
        f.createVariableStatement(
          undefined,
          f.createVariableDeclarationList(
            d.entries.map((e) =>
              f.createVariableDeclaration(
                e.name,
                d.type && e.value !== undefined ? lowerType(d.type) : undefined,
                e.value ? lowerExpr(e.value) : undefined,
              ),
            ),
            go.NodeFlags.Const,
          ),
        ),
        d.doc,
      );
  }
}

/** Lower a file; imports are the union of `file.imports` and every
 *  package the lowered declarations reference. */
export function lowerFile(file: GoFile): go.SourceFile {
  const decls = file.decls.map(lowerDecl);
  const imports = [
    ...new Set([...file.imports, ...collectImports(decls)]),
  ].sort();
  const statements: AstStmt[] = [];
  if (imports.length > 0) statements.push(f.createImportStatement(imports));
  statements.push(...decls);
  return f.createSourceFile(file.pkg, statements);
}
