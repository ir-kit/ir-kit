import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftKeyPathExpression extends SwiftNodeBase {
  components: ReadonlyArray<string>;
  kind: SwiftNodeKind.KeyPathExpression;
  root?: SwiftType;
}

export function createKeyPathExpression(
  components: ReadonlyArray<string>,
  root?: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftKeyPathExpression {
  return {
    components,
    kind: SwiftNodeKind.KeyPathExpression,
    leadingComments,
    root,
    trailingComments,
  };
}
