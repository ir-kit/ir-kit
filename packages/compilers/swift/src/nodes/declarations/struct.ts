import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type {
  SwiftAttribute,
  SwiftGenericParameter,
  SwiftGenericRequirement,
  SwiftInheritanceClause,
  SwiftModifier,
} from './shared';

export interface SwiftStructDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  genericParameters?: ReadonlyArray<SwiftGenericParameter>;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  inheritanceClause?: SwiftInheritanceClause;
  kind: SwiftNodeKind.StructDeclaration;
  members: ReadonlyArray<SwiftStatement>;
  modifiers?: ReadonlyArray<SwiftModifier>;
  name: string;
}

export function createStructDeclaration(
  name: string,
  members: ReadonlyArray<SwiftStatement>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  inheritanceClause?: SwiftInheritanceClause,
  genericParameters?: ReadonlyArray<SwiftGenericParameter>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftStructDeclaration {
  return {
    attributes,
    genericParameters,
    genericWhereClause,
    inheritanceClause,
    kind: SwiftNodeKind.StructDeclaration,
    leadingComments,
    members,
    modifiers,
    name,
    trailingComments,
  };
}
