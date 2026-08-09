import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';
import type { SwiftAccessorBlock } from './accessor-block';
import type { SwiftFunctionParameter } from './function';
import type {
  SwiftAttribute,
  SwiftGenericParameter,
  SwiftGenericRequirement,
  SwiftModifier,
} from './shared';

export interface SwiftSubscriptDeclaration extends SwiftNodeBase {
  accessorBlock: SwiftAccessorBlock;
  attributes?: ReadonlyArray<SwiftAttribute>;
  genericParameters?: ReadonlyArray<SwiftGenericParameter>;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  kind: SwiftNodeKind.SubscriptDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
  parameters: ReadonlyArray<SwiftFunctionParameter>;
  returnType: SwiftType;
}

export function createSubscriptDeclaration(
  parameters: ReadonlyArray<SwiftFunctionParameter>,
  returnType: SwiftType,
  accessorBlock: SwiftAccessorBlock,
  modifiers?: ReadonlyArray<SwiftModifier>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericParameters?: ReadonlyArray<SwiftGenericParameter>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSubscriptDeclaration {
  return {
    accessorBlock,
    attributes,
    genericParameters,
    genericWhereClause,
    kind: SwiftNodeKind.SubscriptDeclaration,
    leadingComments,
    modifiers,
    parameters,
    returnType,
    trailingComments,
  };
}
