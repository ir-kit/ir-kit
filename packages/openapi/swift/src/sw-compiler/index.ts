import { swift } from "@ir-kit/compiler-swift";

import type { SwDecl, SwFile } from "../ast/index.js";

const f = swift.factory;
const printer = swift.createPrinter();
const trimEnd = (s: string) => s.replace(/\n+$/, "");

export function printFile(file: SwFile): string {
  return printer.printFile(
    f.createSourceFile([
      ...file.imports.map((i) => f.createImportDeclaration(i)),
      ...file.conditionalImports.map((i) =>
        f.createConditionalCompilation(`canImport(${i})`, [
          f.createImportDeclaration(i),
        ]),
      ),
      ...file.decls.map((d) => d.node),
    ]),
  );
}

export const printDecl = (d: SwDecl): string =>
  trimEnd(printer.printFile(d.node));
