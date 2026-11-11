import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import type { JavaTypeParameter } from '../expressions/type';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import type { JavaBlock } from '../statements/block';
import { createBlock } from '../statements/block';
import type { JavaMethodParameter } from './method-parameter';

export interface JavaMethodDeclaration extends JavaNodeBase {
  annotations?: ReadonlyArray<JavaExpression>;
  body: JavaBlock;
  defaultValue?: JavaExpression;
  kind: JavaNodeKind.MethodDeclaration;
  modifiers?: ReadonlyArray<string>;
  name: string;
  parameters: ReadonlyArray<JavaMethodParameter>;
  returnType?: JavaExpression; // used for annotation elements
  throws?: ReadonlyArray<JavaExpression>;
  typeParameters?: ReadonlyArray<JavaTypeParameter>;
}

export function createMethodDeclaration(
  name: string,
  parameters: ReadonlyArray<JavaMethodParameter>,
  returnType: JavaExpression | undefined,
  body: ReadonlyArray<JavaStatement>,
  modifiers?: ReadonlyArray<string>,
  annotations?: ReadonlyArray<JavaExpression>,
  typeParameters?: ReadonlyArray<JavaTypeParameter>,
  throwsClause?: ReadonlyArray<JavaExpression>,
  defaultValue?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaMethodDeclaration {
  return {
    annotations,
    body: createBlock(body),
    defaultValue,
    kind: JavaNodeKind.MethodDeclaration,
    leadingComments,
    modifiers,
    name,
    parameters,
    returnType,
    throws: throwsClause,
    trailingComments,
    typeParameters,
  };
}
