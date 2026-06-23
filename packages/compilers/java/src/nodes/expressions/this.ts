import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaThisExpression extends JavaNodeBase {
  kind: JavaNodeKind.ThisExpression;
}

export function createThisExpression(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaThisExpression {
  return {
    kind: JavaNodeKind.ThisExpression,
    leadingComments,
    trailingComments,
  };
}
