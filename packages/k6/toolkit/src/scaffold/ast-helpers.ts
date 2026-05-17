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

/** `export const <localName> = <sourceVar>.<sourceProp>;` */
export function reExportConst(
  localName: string,
  sourceVar: string,
  sourceProp: string,
): ts.Statement {
  return f.createVariableStatement(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    f.createVariableDeclarationList(
      [
        f.createVariableDeclaration(
          localName,
          undefined,
          undefined,
          f.createPropertyAccessExpression(
            f.createIdentifier(sourceVar),
            f.createIdentifier(sourceProp),
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
}

/** `export default <sourceVar>.<sourceProp>;` */
export function defaultExportProp(
  sourceVar: string,
  sourceProp: string,
): ts.Statement {
  return f.createExportAssignment(
    undefined,
    false,
    f.createPropertyAccessExpression(
      f.createIdentifier(sourceVar),
      f.createIdentifier(sourceProp),
    ),
  );
}
