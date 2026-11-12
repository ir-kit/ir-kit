import ts from "typescript";

const f = ts.factory;

/** Modern factory accepts `SyntaxKind.TypeKeyword` as the phase modifier to express `import type`. */
function phase(
  typeOnly: boolean | undefined,
): ts.SyntaxKind.TypeKeyword | undefined {
  return typeOnly ? ts.SyntaxKind.TypeKeyword : undefined;
}

export interface NamedImportSpec {
  /** Name exported by the module. */
  name: string;
  /** Local alias. Omit to use `name` as-is. */
  alias?: string;
  /** `true` → `import type { … }`. */
  typeOnly?: boolean;
}

/** `import { a, b as c } from "mod";` */
export function namedImport(
  specs: ReadonlyArray<NamedImportSpec>,
  moduleSpecifier: string,
  options: { typeOnly?: boolean } = {},
): ts.ImportDeclaration {
  const elements = specs.map((s) =>
    f.createImportSpecifier(
      s.typeOnly ?? false,
      s.alias ? f.createIdentifier(s.name) : undefined,
      f.createIdentifier(s.alias ?? s.name),
    ),
  );
  return f.createImportDeclaration(
    undefined,
    f.createImportClause(
      phase(options.typeOnly),
      undefined,
      f.createNamedImports(elements),
    ),
    f.createStringLiteral(moduleSpecifier),
  );
}

/** `import * as name from "mod";` (add `typeOnly: true` for `import type * as name`). */
export function namespaceImport(
  name: string,
  moduleSpecifier: string,
  options: { typeOnly?: boolean } = {},
): ts.ImportDeclaration {
  return f.createImportDeclaration(
    undefined,
    f.createImportClause(
      phase(options.typeOnly),
      undefined,
      f.createNamespaceImport(f.createIdentifier(name)),
    ),
    f.createStringLiteral(moduleSpecifier),
  );
}

/** `import name from "mod";` */
export function defaultImport(
  name: string,
  moduleSpecifier: string,
): ts.ImportDeclaration {
  return f.createImportDeclaration(
    undefined,
    f.createImportClause(undefined, f.createIdentifier(name), undefined),
    f.createStringLiteral(moduleSpecifier),
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
