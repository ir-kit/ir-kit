import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftOptionalType extends SwiftNodeBase {
  kind: SwiftNodeKind.OptionalType;
  wrappedType: SwiftType;
}

export function createOptionalType(
  wrappedType: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftOptionalType {
  return {
    kind: SwiftNodeKind.OptionalType,
    leadingComments,
    trailingComments,
    wrappedType,
  };
}
