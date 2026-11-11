import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export type JavaImportName = {
  alias?: string;
  name: string;
};

export interface JavaImportStatement extends JavaNodeBase {
  kind: JavaNodeKind.ImportStatement;
  names?: ReadonlyArray<JavaImportName>;
  path: string;
  static?: boolean;
}

export function createImportStatement(
  path: string,
  names?: ReadonlyArray<JavaImportName>,
  isStatic: boolean = false,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaImportStatement {
  return {
    kind: JavaNodeKind.ImportStatement,
    leadingComments,
    names,
    path,
    static: isStatic,
    trailingComments,
  };
}
