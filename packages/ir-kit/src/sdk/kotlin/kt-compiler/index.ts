import { kt } from "../../../compilers/kotlin/index.js";

import type { KtDecl, KtFile } from "../ast/index.js";

const f = kt.factory;
const printer = kt.createPrinter({ indentSize: 4 });
const trimEnd = (s: string) => s.replace(/\n+$/, "");

export function printFile(file: KtFile): string {
  return printer.printFile(
    f.createSourceFile(
      file.decls.map((d) => d.node),
      file.pkg ? f.createPackageHeader(file.pkg) : undefined,
      file.imports.map((i) => f.createImportDirective(i)),
    ),
  );
}

export const printDecl = (d: KtDecl): string =>
  trimEnd(printer.printFile(d.node));
