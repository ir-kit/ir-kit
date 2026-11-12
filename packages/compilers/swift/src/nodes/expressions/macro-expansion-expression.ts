import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftCallArgument } from "./function-call-expression.js";

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
