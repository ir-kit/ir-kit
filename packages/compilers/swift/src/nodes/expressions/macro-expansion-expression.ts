import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftCallArgument } from './function-call-expression';

export interface SwiftMacroExpansionExpression extends SwiftNodeBase {
  arguments?: ReadonlyArray<SwiftCallArgument>;
  kind: SwiftNodeKind.MacroExpansionExpression;
  macroName: string;
}

export function createMacroExpansionExpression(
  macroName: string,
  args?: ReadonlyArray<SwiftCallArgument>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMacroExpansionExpression {
  return {
    arguments: args,
    kind: SwiftNodeKind.MacroExpansionExpression,
    leadingComments,
    macroName,
    trailingComments,
  };
}
