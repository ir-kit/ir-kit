import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaMethodReferenceExpression extends JavaNodeBase {
  kind: JavaNodeKind.MethodReferenceExpression;
  qualifier: JavaExpression;
  reference: string;
}

export function createMethodReferenceExpression(
  qualifier: JavaExpression,
  reference: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaMethodReferenceExpression {
  return {
    kind: JavaNodeKind.MethodReferenceExpression,
    leadingComments,
    qualifier,
    reference,
    trailingComments,
  };
}
