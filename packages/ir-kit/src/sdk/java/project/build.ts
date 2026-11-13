import { java } from "../../../compilers/java/index.js";

import type { JDecl } from "../ast/index.js";
import { importsFor } from "./imports.js";

export interface BuildOptions {
  packageName?: string;
  layout?: "flat" | "split";
}

export interface BuiltFile {
  path: string;
  content: string;
}

export const DEFAULT_PACKAGE = "com.example.api";

const printer = java.createPrinter({ indentSize: 2 });

export function subPackage(
  root: string,
  layout: BuildOptions["layout"],
  sub: string,
): string {
  return layout === "flat" ? root : `${root}.${sub}`;
}

export function declPackage(decl: JDecl, opts: BuildOptions): string {
  const root = opts.packageName ?? DEFAULT_PACKAGE;
  const isApi =
    decl.kind === "class" || (decl.kind === "interface" && decl.api === true);
  return subPackage(root, opts.layout, isApi ? "api" : "model");
}

export function buildJavaProject(
  decls: ReadonlyArray<JDecl>,
  opts: BuildOptions = {},
): BuiltFile[] {
  const root = opts.packageName ?? DEFAULT_PACKAGE;
  const runtimePkg = subPackage(root, opts.layout, "runtime");
  const packageOf = new Map(decls.map((d) => [d.name, declPackage(d, opts)]));
  return decls.map((decl) => {
    const pkg = declPackage(decl, opts);
    const imports = importsFor(decl, pkg, runtimePkg, packageOf);
    return {
      path: `${pkg.replace(/\./g, "/")}/${decl.name}.java`,
      content: printDecl(decl, pkg, imports),
    };
  });
}

export function printDecl(
  decl: JDecl,
  pkg: string,
  imports: ReadonlyArray<string>,
): string {
  const f = java.factory;
  return printer.printFile(
    f.createSourceFile(pkg, [
      ...imports.map((i) => f.createImportStatement(i)),
      decl.node,
    ]),
  );
}
