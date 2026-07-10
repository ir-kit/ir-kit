import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';

export interface SwiftEnumCasePattern extends SwiftNodeBase {
  associatedValues?: ReadonlyArray<SwiftPattern>;
  caseName: string;
  kind: SwiftNodeKind.EnumCasePattern;
}

export function createEnumCasePattern(
  caseName: string,
  associatedValues?: ReadonlyArray<SwiftPattern>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftEnumCasePattern {
  return {
    associatedValues,
    caseName,
    kind: SwiftNodeKind.EnumCasePattern,
    leadingComments,
    trailingComments,
  };
}
