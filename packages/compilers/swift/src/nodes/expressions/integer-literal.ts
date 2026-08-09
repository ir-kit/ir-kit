import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftIntegerLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.IntegerLiteral;
  literal: string;
}

export function createIntegerLiteral(
  literal: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIntegerLiteral {
  return {
    kind: SwiftNodeKind.IntegerLiteral,
    leadingComments,
    literal,
    trailingComments,
  };
}
