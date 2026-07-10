import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type {
  SwiftAttribute,
  SwiftGenericRequirement,
  SwiftInheritanceClause,
  SwiftModifier,
} from './shared';

export interface SwiftProtocolDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  inheritanceClause?: SwiftInheritanceClause;
  kind: SwiftNodeKind.ProtocolDeclaration;
  members: ReadonlyArray<SwiftStatement>;
  modifiers?: ReadonlyArray<SwiftModifier>;
  name: string;
}

export function createProtocolDeclaration(
  name: string,
  members: ReadonlyArray<SwiftStatement>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  inheritanceClause?: SwiftInheritanceClause,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftProtocolDeclaration {
  return {
    attributes,
    genericWhereClause,
    inheritanceClause,
    kind: SwiftNodeKind.ProtocolDeclaration,
    leadingComments,
    members,
    modifiers,
    name,
    trailingComments,
  };
}
