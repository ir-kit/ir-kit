import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoReceiver extends GoNodeBase {
  kind: GoNodeKind.Receiver;
  name: string;
  type: GoExpression;
}

export function createReceiver(
  name: string,
  type: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoReceiver {
  return {
    kind: GoNodeKind.Receiver,
    leadingComments,
    name,
    trailingComments,
    type,
  };
}
