import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftCompositionType extends SwiftNodeBase {
  elements: ReadonlyArray<SwiftType>;
  kind: SwiftNodeKind.CompositionType;
}

export function createCompositionType(
  elements: ReadonlyArray<SwiftType>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftCompositionType {
  return {
    elements,
    kind: SwiftNodeKind.CompositionType,
    leadingComments,
    trailingComments,
  };
}
