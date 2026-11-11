import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoShortVarDeclaration extends GoNodeBase {
  kind: GoNodeKind.ShortVarDeclaration;
  names: ReadonlyArray<string>;
  values: ReadonlyArray<GoExpression>;
}

export function createShortVarDeclaration(
  nameOrNames: string | ReadonlyArray<string>,
  valueOrValues: GoExpression | ReadonlyArray<GoExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoShortVarDeclaration {
  const names = nameOrNames instanceof Array ? nameOrNames : [nameOrNames];
  const values = valueOrValues instanceof Array ? valueOrValues : [valueOrValues];

  return {
    kind: GoNodeKind.ShortVarDeclaration,
    leadingComments,
    names,
    trailingComments,
    values,
  };
}
