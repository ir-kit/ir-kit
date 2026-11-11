import type { SwiftExpression } from "./expression.js";
import type { SwiftNodeKind } from "./kinds.js";
import type { SwiftPattern } from "./pattern.js";
import type { SwiftStatement } from "./statement.js";
import type { SwiftSourceFile } from "./structure/source-file.js";
import type { SwiftType } from "./type.js";

export interface SwiftNodeBase {
  kind: SwiftNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type SwiftNode =
  | SwiftSourceFile
  | SwiftExpression
  | SwiftPattern
  | SwiftStatement
  | SwiftType;
