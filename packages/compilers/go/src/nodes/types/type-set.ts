import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

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
