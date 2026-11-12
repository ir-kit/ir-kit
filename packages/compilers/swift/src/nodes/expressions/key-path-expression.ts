import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftKeyPathExpression extends SwiftNodeBase {
  components: ReadonlyArray<string>;
  kind: SwiftNodeKind.KeyPathExpression;
  root?: SwiftType;
}

export function createKeyPathExpression(
  components: ReadonlyArray<string>,
  root?: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftKeyPathExpression {
  return {
    components,
    kind: SwiftNodeKind.KeyPathExpression,
    leadingComments,
    root,
    trailingComments,
  };
}
