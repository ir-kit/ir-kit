import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";

export type GoImportPath = {
  alias?: GoImportAlias;
  path: string;
};

export type GoImportAlias = string | "_" | ".";

export interface GoImportStatement extends GoNodeBase {
  kind: GoNodeKind.ImportStatement;
  paths: ReadonlyArray<GoImportPath>;
}

export function createImportStatement(
  paths: ReadonlyArray<GoImportPath | string> | GoImportPath | string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoImportStatement {
  const normalizedPaths = (paths instanceof Array ? paths : [paths]).map(
    (path): GoImportPath => (typeof path === "string" ? { path } : path),
  );

  return {
    kind: GoNodeKind.ImportStatement,
    leadingComments,
    paths: normalizedPaths,
    trailingComments,
  };
}
