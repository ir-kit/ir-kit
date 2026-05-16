import ts from "typescript";

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
});

/** Render TS AST statements into a source-file string. */
export function printStatements(
  statements: ReadonlyArray<ts.Statement>,
  header?: string,
): string {
  const source = ts.createSourceFile(
    "out.ts",
    "",
    ts.ScriptTarget.ES2022,
    false,
    ts.ScriptKind.TS,
  );
  const body = statements
    .map((stmt) => printer.printNode(ts.EmitHint.Unspecified, stmt, source))
    .join("\n\n");
  return header ? `${header}\n\n${body}\n` : `${body}\n`;
}
