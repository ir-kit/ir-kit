import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftFloatLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.FloatLiteral;
  literal: string;
}

export function createFloatLiteral(
  literal: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftFloatLiteral {
  return {
    kind: SwiftNodeKind.FloatLiteral,
    leadingComments,
    literal,
    trailingComments,
  };
}
