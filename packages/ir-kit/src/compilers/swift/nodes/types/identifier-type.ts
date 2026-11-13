import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftIdentifierType extends SwiftNodeBase {
  genericArguments?: ReadonlyArray<SwiftType>;
  kind: SwiftNodeKind.IdentifierType;
  name: string;
}

export function createIdentifierType(
  name: string,
  genericArguments?: ReadonlyArray<SwiftType>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIdentifierType {
  return {
    genericArguments,
    kind: SwiftNodeKind.IdentifierType,
    leadingComments,
    name,
    trailingComments,
  };
}
