import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export type SwiftDictionaryElement = {
  key: SwiftExpression;
  value: SwiftExpression;
};

export interface SwiftDictionaryLiteral extends SwiftNodeBase {
  content: ReadonlyArray<SwiftDictionaryElement>;
  kind: SwiftNodeKind.DictionaryLiteral;
}

export function createDictionaryLiteral(
  content: ReadonlyArray<SwiftDictionaryElement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDictionaryLiteral {
  return {
    content,
    kind: SwiftNodeKind.DictionaryLiteral,
    leadingComments,
    trailingComments,
  };
}
