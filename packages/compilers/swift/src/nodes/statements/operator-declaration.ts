import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export type SwiftFixitySpecifier = 'infix' | 'postfix' | 'prefix';

export interface SwiftOperatorDeclaration extends SwiftNodeBase {
  fixitySpecifier: SwiftFixitySpecifier;
  kind: SwiftNodeKind.OperatorDeclaration;
  name: string;
  precedenceGroup?: string;
}

export function createOperatorDeclaration(
  fixitySpecifier: SwiftFixitySpecifier,
  name: string,
  precedenceGroup?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftOperatorDeclaration {
  return {
    fixitySpecifier,
    kind: SwiftNodeKind.OperatorDeclaration,
    leadingComments,
    name,
    precedenceGroup,
    trailingComments,
  };
}
