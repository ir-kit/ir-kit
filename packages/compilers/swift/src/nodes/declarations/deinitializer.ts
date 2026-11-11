import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";
import type { SwiftAttribute } from "./shared.js";

export interface SwiftDeinitializerDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  body: ReadonlyArray<SwiftStatement>;
  kind: SwiftNodeKind.DeinitializerDeclaration;
}

export function createDeinitializerDeclaration(
  body: ReadonlyArray<SwiftStatement>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDeinitializerDeclaration {
  return {
    attributes,
    body,
    kind: SwiftNodeKind.DeinitializerDeclaration,
    leadingComments,
    trailingComments,
  };
}
