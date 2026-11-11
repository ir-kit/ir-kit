import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaArrayInitializer extends JavaNodeBase {
  elements: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.ArrayInitializer;
}

export function createArrayInitializer(
  elements?: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaArrayInitializer {
  return {
    elements: elements ?? [],
    kind: JavaNodeKind.ArrayInitializer,
    leadingComments,
    trailingComments,
  };
}
