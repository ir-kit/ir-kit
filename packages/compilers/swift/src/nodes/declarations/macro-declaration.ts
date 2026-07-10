import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';
import type { SwiftFunctionParameter } from './function';
import type { SwiftAttribute, SwiftModifier } from './shared';

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
