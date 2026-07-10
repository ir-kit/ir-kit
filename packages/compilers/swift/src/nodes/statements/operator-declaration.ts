import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export type SwiftOperatorFixity = 'infix' | 'postfix' | 'prefix';

export interface SwiftOperatorDeclaration extends SwiftNodeBase {
  fixity: SwiftOperatorFixity;
  kind: SwiftNodeKind.OperatorDeclaration;
  name: string;
  precedenceGroup?: string;
}

export function createOperatorDeclaration(
  fixity: SwiftOperatorFixity,
  name: string,
  precedenceGroup?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftOperatorDeclaration {
  return {
    fixity,
    kind: SwiftNodeKind.OperatorDeclaration,
    leadingComments,
    name,
    precedenceGroup,
    trailingComments,
  };
}
