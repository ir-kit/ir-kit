import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

export interface SwiftSourceFile extends SwiftNodeBase {
  kind: SwiftNodeKind.SourceFile;
  statements: ReadonlyArray<SwiftStatement>;
}

export function createSourceFile(
  statements: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSourceFile {
  return {
    kind: SwiftNodeKind.SourceFile,
    leadingComments,
    statements,
    trailingComments,
  };
}
