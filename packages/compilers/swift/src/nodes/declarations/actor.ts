import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftAttribute, SwiftModifier } from './shared';

export interface SwiftActorDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  kind: SwiftNodeKind.ActorDeclaration;
  members: ReadonlyArray<SwiftStatement>;
  modifiers?: ReadonlyArray<SwiftModifier>;
  name: string;
}

export function createActorDeclaration(
  name: string,
  members: ReadonlyArray<SwiftStatement>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftActorDeclaration {
  return {
    attributes,
    kind: SwiftNodeKind.ActorDeclaration,
    leadingComments,
    members,
    modifiers,
    name,
    trailingComments,
  };
}
