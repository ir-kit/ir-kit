import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export type SwiftPrecedenceGroupAssociativity = "left" | "none" | "right";

export interface SwiftPrecedenceGroupDeclaration extends SwiftNodeBase {
  assignment?: boolean;
  associativity?: SwiftPrecedenceGroupAssociativity;
  higherThan?: ReadonlyArray<string>;
  kind: SwiftNodeKind.PrecedenceGroupDeclaration;
  lowerThan?: ReadonlyArray<string>;
  name: string;
}

export function createPrecedenceGroupDeclaration(
  name: string,
  associativity?: SwiftPrecedenceGroupAssociativity,
  higherThan?: ReadonlyArray<string>,
  lowerThan?: ReadonlyArray<string>,
  assignment?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPrecedenceGroupDeclaration {
  return {
    assignment,
    associativity,
    higherThan,
    kind: SwiftNodeKind.PrecedenceGroupDeclaration,
    leadingComments,
    lowerThan,
    name,
    trailingComments,
  };
}
