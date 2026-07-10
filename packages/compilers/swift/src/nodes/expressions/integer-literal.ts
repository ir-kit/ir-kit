import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftIntegerLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.IntegerLiteral;
  value: string;
}

export function createIntegerLiteral(
  value: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIntegerLiteral {
  return {
    kind: SwiftNodeKind.IntegerLiteral,
    leadingComments,
    trailingComments,
    value,
  };
}
