import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export type GoStructField = {
  name?: string;
  tag?: string;
  type: GoExpression;
};

export interface GoStructType extends GoNodeBase {
  fields: ReadonlyArray<GoStructField>;
  kind: GoNodeKind.StructType;
}

export function createStructType(
  fields: ReadonlyArray<GoStructField>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoStructType {
  return {
    fields,
    kind: GoNodeKind.StructType,
    leadingComments,
    trailingComments,
  };
}
