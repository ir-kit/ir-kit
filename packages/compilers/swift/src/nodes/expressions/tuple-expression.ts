import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export type SwiftTupleElement = {
  expression: SwiftExpression;
  label?: string;
};

export interface SwiftTupleExpression extends SwiftNodeBase {
  elements: ReadonlyArray<SwiftTupleElement>;
  kind: SwiftNodeKind.TupleExpression;
}

export function createTupleExpression(
  elements: ReadonlyArray<SwiftTupleElement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTupleExpression {
  return {
    elements,
    kind: SwiftNodeKind.TupleExpression,
    leadingComments,
    trailingComments,
  };
}
