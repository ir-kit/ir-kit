import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaIdentifier extends JavaNodeBase {
  kind: JavaNodeKind.Identifier;
  name: string;
}

export function createIdentifier(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaIdentifier {
  return {
    kind: JavaNodeKind.Identifier,
    leadingComments,
    name,
    trailingComments,
  };
}
