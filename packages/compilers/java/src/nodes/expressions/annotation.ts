import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaAnnotation extends JavaNodeBase {
  args?: ReadonlyArray<JavaExpression> | ReadonlyArray<{ name?: string; value: JavaExpression }>;
  kind: JavaNodeKind.Annotation;
  name: JavaExpression;
}

export function createAnnotation(
  name: JavaExpression,
  args?: ReadonlyArray<JavaExpression> | ReadonlyArray<{ name?: string; value: JavaExpression }>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaAnnotation {
  return {
    args,
    kind: JavaNodeKind.Annotation,
    leadingComments,
    name,
    trailingComments,
  };
}
