import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftBooleanLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.BooleanLiteral;
  value: boolean;
}

export function createBooleanLiteral(
  value: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftBooleanLiteral {
  return {
    kind: SwiftNodeKind.BooleanLiteral,
    leadingComments,
    trailingComments,
    value,
  };
}
