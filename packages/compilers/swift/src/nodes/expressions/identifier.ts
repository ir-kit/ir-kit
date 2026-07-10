import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftIdentifier extends SwiftNodeBase {
  baseName: string;
  kind: SwiftNodeKind.Identifier;
}

export function createIdentifier(
  baseName: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIdentifier {
  return {
    baseName,
    kind: SwiftNodeKind.Identifier,
    leadingComments,
    trailingComments,
  };
}
