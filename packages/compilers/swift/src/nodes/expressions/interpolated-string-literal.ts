import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export type SwiftInterpolationSegment = { text: string } | { expression: SwiftExpression };

export interface SwiftInterpolatedStringLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.InterpolatedStringLiteral;
  segments: ReadonlyArray<SwiftInterpolationSegment>;
}

export function createInterpolatedStringLiteral(
  segments: ReadonlyArray<SwiftInterpolationSegment>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftInterpolatedStringLiteral {
  return {
    kind: SwiftNodeKind.InterpolatedStringLiteral,
    leadingComments,
    segments,
    trailingComments,
  };
}
