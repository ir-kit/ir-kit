import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export type JavaModifier = 'public' | 'private' | 'protected' | 'static' | 'final' | 'volatile';

export interface JavaVariableDeclaration extends JavaNodeBase {
  annotations?: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.VariableDeclaration;
  modifiers?: ReadonlyArray<JavaModifier>;
  name: string;
  type?: JavaExpression;
  value?: JavaExpression;
}

export function createVariableDeclaration(
  name: string,
  type?: JavaExpression,
  value?: JavaExpression,
  modifiers?: ReadonlyArray<JavaModifier>,
  annotations?: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaVariableDeclaration {
  return {
    annotations,
    kind: JavaNodeKind.VariableDeclaration,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    type,
    value,
  };
}
