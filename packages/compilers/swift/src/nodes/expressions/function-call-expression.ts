import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export type SwiftCallArgument = {
  expression: SwiftExpression;
  label?: string;
};

export interface SwiftFunctionCallExpression extends SwiftNodeBase {
  arguments: ReadonlyArray<SwiftCallArgument>;
  calledExpression: SwiftExpression;
  kind: SwiftNodeKind.FunctionCallExpression;
}

export function createFunctionCallExpression(
  calledExpression: SwiftExpression,
  args: ReadonlyArray<SwiftCallArgument>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftFunctionCallExpression {
  return {
    arguments: args,
    calledExpression,
    kind: SwiftNodeKind.FunctionCallExpression,
    leadingComments,
    trailingComments,
  };
}
