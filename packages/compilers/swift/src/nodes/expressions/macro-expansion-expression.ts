import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftCallArgument } from './function-call-expression';

export interface SwiftMacroExpansionExpression extends SwiftNodeBase {
  arguments?: ReadonlyArray<SwiftCallArgument>;
  kind: SwiftNodeKind.MacroExpansionExpression;
  name: string;
}

export function createMacroExpansionExpression(
  name: string,
  args?: ReadonlyArray<SwiftCallArgument>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMacroExpansionExpression {
  return {
    arguments: args,
    kind: SwiftNodeKind.MacroExpansionExpression,
    leadingComments,
    name,
    trailingComments,
  };
}
