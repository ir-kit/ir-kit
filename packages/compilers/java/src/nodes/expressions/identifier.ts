import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";

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
