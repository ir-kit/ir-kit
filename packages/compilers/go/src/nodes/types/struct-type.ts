import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

export type GoStructField = {
  leadingComments?: ReadonlyArray<string>;
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
