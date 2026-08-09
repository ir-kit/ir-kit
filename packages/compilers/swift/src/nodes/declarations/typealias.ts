import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';
import type {
  SwiftAttribute,
  SwiftGenericParameter,
  SwiftGenericRequirement,
  SwiftModifier,
} from './shared';

export interface SwiftTypeAliasDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  genericParameters?: ReadonlyArray<SwiftGenericParameter>;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  kind: SwiftNodeKind.TypeAliasDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
  name: string;
  type: SwiftType;
}

export function createTypeAliasDeclaration(
  name: string,
  type: SwiftType,
  modifiers?: ReadonlyArray<SwiftModifier>,
  genericParameters?: ReadonlyArray<SwiftGenericParameter>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTypeAliasDeclaration {
  return {
    attributes,
    genericParameters,
    genericWhereClause,
    kind: SwiftNodeKind.TypeAliasDeclaration,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    type,
  };
}
