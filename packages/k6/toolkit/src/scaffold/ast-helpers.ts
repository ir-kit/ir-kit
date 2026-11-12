import ts from "typescript";

const f = ts.factory;

/** `{ k: v, … }` — multiline optional. Shared by loadtest scaffolders. */
export function objLit(
  props: Record<string, ts.Expression>,
  multiline = false,
): ts.ObjectLiteralExpression {
  return f.createObjectLiteralExpression(
    Object.entries(props).map(([k, v]) => f.createPropertyAssignment(k, v)),
    multiline,
  );
}

/** `const <name> = <init>;` */
export function varConst(name: string, init: ts.Expression): ts.Statement {
  return f.createVariableStatement(
    undefined,
    f.createVariableDeclarationList(
      [f.createVariableDeclaration(name, undefined, undefined, init)],
      ts.NodeFlags.Const,
    ),
  );
}
