import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export type GoTypeTerm = {
  approximate?: boolean;
  type: GoType;
};

export interface GoTypeSet extends GoNodeBase {
  kind: GoNodeKind.TypeSet;
  terms: ReadonlyArray<GoTypeTerm>;
}

export function createTypeSet(
  terms: ReadonlyArray<GoTypeTerm>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoTypeSet {
  return {
    kind: GoNodeKind.TypeSet,
    leadingComments,
    terms,
    trailingComments,
  };
}
