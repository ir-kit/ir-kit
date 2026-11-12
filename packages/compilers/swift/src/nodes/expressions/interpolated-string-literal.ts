import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export type SwiftInterpolationSegment =
  | { content: string }
  | { expression: SwiftExpression };

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
