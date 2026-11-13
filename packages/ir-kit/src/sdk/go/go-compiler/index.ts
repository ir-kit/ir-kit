import { go } from "../../../compilers/go/index.js";

import type { GoDecl } from "../ast/index.js";
import { collectImports } from "./imports.js";

export interface GoFile {
  pkg: string;
  decls: ReadonlyArray<GoDecl>;
  /** Extra imports beyond the ones the declarations reference. */
  imports?: ReadonlyArray<string>;
}

export const goFile = (file: GoFile): GoFile => file;

const printer = go.createPrinter();
const trimEnd = (s: string) => s.replace(/\n+$/, "");

/** Print a file; imports are every package the declarations reference
 *  plus `file.imports`. */
export function printFile(file: GoFile): string {
  const nodes = file.decls.map((d) => d.node);
  const imports = [
    ...new Set([...(file.imports ?? []), ...collectImports(nodes)]),
  ].sort();
  const statements: go.Statement[] = [];
  if (imports.length > 0)
    statements.push(go.factory.createImportStatement(imports));
  statements.push(...nodes);
  return `${trimEnd(printer.printFile(go.factory.createSourceFile(file.pkg, statements)))}\n`;
}

export const printDecl = (d: GoDecl): string =>
  trimEnd(printer.printFile(d.node));
