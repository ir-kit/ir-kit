import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';
import type { SwiftAccessorBlock } from './accessor-block';
import type { SwiftAttribute } from './shared';

export type SwiftBindingSpecifier = 'let' | 'var';

export type SwiftPatternBinding = {
  accessorBlock?: SwiftAccessorBlock;
  name: string;
  type?: SwiftType;
  value?: SwiftExpression;
};

export interface SwiftVariableDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  bindingSpecifier: SwiftBindingSpecifier;
  bindings: ReadonlyArray<SwiftPatternBinding>;
  isAsync?: boolean;
  kind: SwiftNodeKind.VariableDeclaration;
}

export function createVariableDeclaration(
  bindingSpecifier: SwiftBindingSpecifier,
  bindings: ReadonlyArray<SwiftPatternBinding>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  isAsync?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftVariableDeclaration {
  return {
    attributes,
    bindingSpecifier,
    bindings,
    isAsync,
    kind: SwiftNodeKind.VariableDeclaration,
    leadingComments,
    trailingComments,
  };
}
