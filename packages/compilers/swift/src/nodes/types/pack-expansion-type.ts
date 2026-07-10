import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftPackExpansionType extends SwiftNodeBase {
  kind: SwiftNodeKind.PackExpansionType;
  repetitionPattern: SwiftType;
}

export function createPackExpansionType(
  repetitionPattern: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPackExpansionType {
  return {
    kind: SwiftNodeKind.PackExpansionType,
    leadingComments,
    repetitionPattern,
    trailingComments,
  };
}
