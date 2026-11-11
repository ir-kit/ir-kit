import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftBooleanLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.BooleanLiteral;
  literal: boolean;
}

export function createBooleanLiteral(
  literal: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftBooleanLiteral {
  return {
    kind: SwiftNodeKind.BooleanLiteral,
    leadingComments,
    literal,
    trailingComments,
  };
}
