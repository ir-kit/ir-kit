import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";

export interface GoIdentifier extends GoNodeBase {
  kind: GoNodeKind.Identifier;
  name: string;
}

export function createIdentifier(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoIdentifier {
  return {
    kind: GoNodeKind.Identifier,
    leadingComments,
    name,
    trailingComments,
  };
}
