import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";

export type JavaLiteralValue = string | number | boolean | null;

export interface JavaLiteral extends JavaNodeBase {
  kind: JavaNodeKind.Literal;
  value: JavaLiteralValue;
}

export function createLiteral(
  value: JavaLiteralValue,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaLiteral {
  return {
    kind: JavaNodeKind.Literal,
    leadingComments,
    trailingComments,
    value,
  };
}
