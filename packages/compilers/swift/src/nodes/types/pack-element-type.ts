import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftPackElementType extends SwiftNodeBase {
  kind: SwiftNodeKind.PackElementType;
  pack: SwiftType;
}

export function createPackElementType(
  pack: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPackElementType {
  return {
    kind: SwiftNodeKind.PackElementType,
    leadingComments,
    pack,
    trailingComments,
  };
}
