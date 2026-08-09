import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftFunctionParameter } from './function';
import type { SwiftAttribute, SwiftGenericRequirement, SwiftModifier } from './shared';

export interface SwiftInitializerDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  body: ReadonlyArray<SwiftStatement>;
  failable?: boolean;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  kind: SwiftNodeKind.InitializerDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
  parameters: ReadonlyArray<SwiftFunctionParameter>;
}

export function createInitializerDeclaration(
  parameters: ReadonlyArray<SwiftFunctionParameter>,
  body: ReadonlyArray<SwiftStatement>,
  failable?: boolean,
  modifiers?: ReadonlyArray<SwiftModifier>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftInitializerDeclaration {
  return {
    attributes,
    body,
    failable,
    genericWhereClause,
    kind: SwiftNodeKind.InitializerDeclaration,
    leadingComments,
    modifiers,
    parameters,
    trailingComments,
  };
}
