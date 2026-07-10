import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftIsPattern extends SwiftNodeBase {
  kind: SwiftNodeKind.IsPattern;
  type: SwiftType;
}

export function createIsPattern(
  type: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIsPattern {
  return {
    kind: SwiftNodeKind.IsPattern,
    leadingComments,
    trailingComments,
    type,
  };
}
