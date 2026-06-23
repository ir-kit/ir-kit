import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

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
