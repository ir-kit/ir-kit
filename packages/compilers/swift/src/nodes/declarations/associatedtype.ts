import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftAttribute, SwiftInheritanceClause } from './shared';

export interface SwiftAssociatedTypeDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  inheritanceClause?: SwiftInheritanceClause;
  kind: SwiftNodeKind.AssociatedTypeDeclaration;
  name: string;
}

export function createAssociatedTypeDeclaration(
  name: string,
  inheritanceClause?: SwiftInheritanceClause,
  attributes?: ReadonlyArray<SwiftAttribute>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftAssociatedTypeDeclaration {
  return {
    attributes,
    inheritanceClause,
    kind: SwiftNodeKind.AssociatedTypeDeclaration,
    leadingComments,
    name,
    trailingComments,
  };
}
