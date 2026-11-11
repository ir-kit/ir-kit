import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export type GoStructField = {
  names?: ReadonlyArray<string>;
  tag?: string;
  type: GoType;
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
