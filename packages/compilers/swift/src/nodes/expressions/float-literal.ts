import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftFloatLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.FloatLiteral;
  value: string;
}

export function createFloatLiteral(
  value: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftFloatLiteral {
  return {
    kind: SwiftNodeKind.FloatLiteral,
    leadingComments,
    trailingComments,
    value,
  };
}
