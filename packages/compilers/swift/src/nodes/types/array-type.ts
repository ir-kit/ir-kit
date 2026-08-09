import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftArrayType extends SwiftNodeBase {
  element: SwiftType;
  kind: SwiftNodeKind.ArrayType;
}

export function createArrayType(
  element: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftArrayType {
  return {
    element,
    kind: SwiftNodeKind.ArrayType,
    leadingComments,
    trailingComments,
  };
}
