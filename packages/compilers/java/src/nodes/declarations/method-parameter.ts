import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

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
