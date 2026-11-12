import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftPattern } from "../pattern.js";

export interface SwiftEnumCasePattern extends SwiftNodeBase {
  associatedTuple?: ReadonlyArray<SwiftPattern>;
  caseName: string;
  kind: SwiftNodeKind.EnumCasePattern;
}

export function createEnumCasePattern(
  caseName: string,
  associatedTuple?: ReadonlyArray<SwiftPattern>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftEnumCasePattern {
  return {
    associatedTuple,
    caseName,
    kind: SwiftNodeKind.EnumCasePattern,
    leadingComments,
    trailingComments,
  };
}
