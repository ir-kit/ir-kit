import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';

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
