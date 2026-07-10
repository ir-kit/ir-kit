import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export type SwiftCallArgument = {
  expression: SwiftExpression;
  label?: string;
};

export interface SwiftFunctionCallExpression extends SwiftNodeBase {
  arguments: ReadonlyArray<SwiftCallArgument>;
  callee: SwiftExpression;
  kind: SwiftNodeKind.FunctionCallExpression;
}

export function createFunctionCallExpression(
  callee: SwiftExpression,
  args: ReadonlyArray<SwiftCallArgument>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftFunctionCallExpression {
  return {
    arguments: args,
    callee,
    kind: SwiftNodeKind.FunctionCallExpression,
    leadingComments,
    trailingComments,
  };
}
