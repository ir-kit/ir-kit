import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftCompositionType extends SwiftNodeBase {
  kind: SwiftNodeKind.CompositionType;
  types: ReadonlyArray<SwiftType>;
}

export function createCompositionType(
  types: ReadonlyArray<SwiftType>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftCompositionType {
  return {
    kind: SwiftNodeKind.CompositionType,
    leadingComments,
    trailingComments,
    types,
  };
}
