import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaMethodParameter extends JavaNodeBase {
  annotations?: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.MethodParameter;
  modifiers?: ReadonlyArray<string>;
  name: string;
  type?: JavaExpression;
  varargs?: boolean;
}

export function createMethodParameter(
  name: string,
  type?: JavaExpression,
  modifiers?: ReadonlyArray<string>,
  annotations?: ReadonlyArray<JavaExpression>,
  varargs?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaMethodParameter {
  return {
    annotations,
    kind: JavaNodeKind.MethodParameter,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    type,
    varargs,
  };
}
