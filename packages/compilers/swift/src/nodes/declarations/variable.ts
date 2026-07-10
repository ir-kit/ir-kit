import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';
import type { SwiftAccessorBlock } from './accessor-block';
import type { SwiftAttribute, SwiftModifier } from './shared';

export type SwiftBindingSpecifier = 'let' | 'var';

export type SwiftPatternBinding = {
  accessorBlock?: SwiftAccessorBlock;
  initializer?: SwiftExpression;
  pattern: string;
  typeAnnotation?: SwiftType;
};

export interface SwiftVariableDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  bindingSpecifier: SwiftBindingSpecifier;
  bindings: ReadonlyArray<SwiftPatternBinding>;
  kind: SwiftNodeKind.VariableDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
}

export function createVariableDeclaration(
  bindingSpecifier: SwiftBindingSpecifier,
  bindings: ReadonlyArray<SwiftPatternBinding>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftVariableDeclaration {
  return {
    attributes,
    bindingSpecifier,
    bindings,
    kind: SwiftNodeKind.VariableDeclaration,
    leadingComments,
    modifiers,
    trailingComments,
  };
}
