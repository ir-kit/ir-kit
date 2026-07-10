import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export type SwiftDictionaryElement = {
  key: SwiftExpression;
  value: SwiftExpression;
};

export interface SwiftDictionaryLiteral extends SwiftNodeBase {
  elements: ReadonlyArray<SwiftDictionaryElement>;
  kind: SwiftNodeKind.DictionaryLiteral;
}

export function createDictionaryLiteral(
  elements: ReadonlyArray<SwiftDictionaryElement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDictionaryLiteral {
  return {
    elements,
    kind: SwiftNodeKind.DictionaryLiteral,
    leadingComments,
    trailingComments,
  };
}
