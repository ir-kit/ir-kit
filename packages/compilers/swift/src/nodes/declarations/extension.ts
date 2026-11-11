import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftType } from '../type';
import type {
  SwiftAttribute,
  SwiftGenericRequirement,
  SwiftInheritanceClause,
  SwiftModifier,
} from './shared';

export interface SwiftExtensionDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  extendedType: SwiftType;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  inheritanceClause?: SwiftInheritanceClause;
  kind: SwiftNodeKind.ExtensionDeclaration;
  members: ReadonlyArray<SwiftStatement>;
  modifiers?: ReadonlyArray<SwiftModifier>;
}

export function createExtensionDeclaration(
  extendedType: SwiftType,
  members: ReadonlyArray<SwiftStatement>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  inheritanceClause?: SwiftInheritanceClause,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftExtensionDeclaration {
  return {
    attributes,
    extendedType,
    genericWhereClause,
    inheritanceClause,
    kind: SwiftNodeKind.ExtensionDeclaration,
    leadingComments,
    members,
    modifiers,
    trailingComments,
  };
}
