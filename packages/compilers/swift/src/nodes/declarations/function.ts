import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftType } from '../type';
import type {
  SwiftAttribute,
  SwiftGenericParameter,
  SwiftGenericRequirement,
  SwiftModifier,
} from './shared';

export type SwiftEffectSpecifiers = {
  async?: boolean;
  throws?: boolean;
};

export type SwiftFunctionParameter = {
  defaultValue?: SwiftExpression;
  firstName: string;
  isInout?: boolean;
  isVariadic?: boolean;
  secondName?: string;
  type: SwiftType;
};

export interface SwiftFunctionDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  body?: ReadonlyArray<SwiftStatement>;
  effectSpecifiers?: SwiftEffectSpecifiers;
  genericParameters?: ReadonlyArray<SwiftGenericParameter>;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  kind: SwiftNodeKind.FunctionDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
  name: string;
  parameters: ReadonlyArray<SwiftFunctionParameter>;
  returnType?: SwiftType;
}

export function createFunctionDeclaration(
  name: string,
  parameters: ReadonlyArray<SwiftFunctionParameter>,
  returnType?: SwiftType,
  body?: ReadonlyArray<SwiftStatement>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  genericParameters?: ReadonlyArray<SwiftGenericParameter>,
  effectSpecifiers?: SwiftEffectSpecifiers,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftFunctionDeclaration {
  return {
    attributes,
    body,
    effectSpecifiers,
    genericParameters,
    genericWhereClause,
    kind: SwiftNodeKind.FunctionDeclaration,
    leadingComments,
    modifiers,
    name,
    parameters,
    returnType,
    trailingComments,
  };
}
