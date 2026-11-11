import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";
import type { SwiftFunctionParameter } from "./function.js";
import type { SwiftAttribute, SwiftModifier } from "./shared.js";

export interface SwiftMacroDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  definition?: string;
  kind: SwiftNodeKind.MacroDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
  name: string;
  parameters: ReadonlyArray<SwiftFunctionParameter>;
  returnType?: SwiftType;
}

export function createMacroDeclaration(
  name: string,
  parameters: ReadonlyArray<SwiftFunctionParameter>,
  returnType?: SwiftType,
  definition?: string,
  attributes?: ReadonlyArray<SwiftAttribute>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMacroDeclaration {
  return {
    attributes,
    definition,
    kind: SwiftNodeKind.MacroDeclaration,
    leadingComments,
    modifiers,
    name,
    parameters,
    returnType,
    trailingComments,
  };
}
