import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftIdentifier extends SwiftNodeBase {
  kind: SwiftNodeKind.Identifier;
  name: string;
}

export function createIdentifier(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIdentifier {
  return {
    kind: SwiftNodeKind.Identifier,
    leadingComments,
    name,
    trailingComments,
  };
}
