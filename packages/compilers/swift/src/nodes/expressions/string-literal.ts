import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftStringLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.StringLiteral;
  value: string;
}

export function createStringLiteral(
  value: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftStringLiteral {
  return {
    kind: SwiftNodeKind.StringLiteral,
    leadingComments,
    trailingComments,
    value,
  };
}
