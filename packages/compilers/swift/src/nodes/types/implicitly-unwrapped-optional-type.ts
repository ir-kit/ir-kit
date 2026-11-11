import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftImplicitlyUnwrappedOptionalType extends SwiftNodeBase {
  kind: SwiftNodeKind.ImplicitlyUnwrappedOptionalType;
  wrappedType: SwiftType;
}

export function createImplicitlyUnwrappedOptionalType(
  wrappedType: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftImplicitlyUnwrappedOptionalType {
  return {
    kind: SwiftNodeKind.ImplicitlyUnwrappedOptionalType,
    leadingComments,
    trailingComments,
    wrappedType,
  };
}
