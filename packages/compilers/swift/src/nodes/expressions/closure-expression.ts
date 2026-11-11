import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

export type SwiftCaptureListItem = {
  name: string;
  specifier?: "unowned" | "weak";
};

export interface SwiftClosureExpression extends SwiftNodeBase {
  captureList?: ReadonlyArray<SwiftCaptureListItem>;
  kind: SwiftNodeKind.ClosureExpression;
  parameters: ReadonlyArray<string>;
  statements: ReadonlyArray<SwiftStatement>;
}

export function createClosureExpression(
  parameters: ReadonlyArray<string>,
  statements: ReadonlyArray<SwiftStatement>,
  captureList?: ReadonlyArray<SwiftCaptureListItem>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftClosureExpression {
  return {
    captureList,
    kind: SwiftNodeKind.ClosureExpression,
    leadingComments,
    parameters,
    statements,
    trailingComments,
  };
}
