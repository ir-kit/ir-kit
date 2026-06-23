import type { GoNodeBase } from '../base';
import type { GoCallExpression } from '../expressions/call';
import { GoNodeKind } from '../kinds';

export interface GoDeferStatement extends GoNodeBase {
  call: GoCallExpression;
  kind: GoNodeKind.DeferStatement;
}

export function createDeferStatement(call: GoCallExpression): GoDeferStatement {
  return {
    call,
    kind: GoNodeKind.DeferStatement,
  };
}
