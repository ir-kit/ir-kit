import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaSuperExpression extends JavaNodeBase {
  kind: JavaNodeKind.SuperExpression;
}

export function createSuperExpression(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaSuperExpression {
  return {
    kind: JavaNodeKind.SuperExpression,
    leadingComments,
    trailingComments,
  };
}
