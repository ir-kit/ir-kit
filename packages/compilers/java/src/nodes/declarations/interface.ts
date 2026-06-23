import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import type { JavaTypeParameter } from '../expressions/type';
import { JavaNodeKind } from '../kinds';
import type { JavaBlock } from '../statements/block';
import { createBlock } from '../statements/block';
import type { JavaMethodDeclaration } from './method';
import type { JavaVariableDeclaration } from './variable';

export type JavaInterfaceMember =
  | JavaMethodDeclaration
  | JavaVariableDeclaration
  | JavaInterfaceDeclaration;

export interface JavaInterfaceDeclaration extends JavaNodeBase {
  annotationInterface?: boolean;
  annotations?: ReadonlyArray<JavaExpression>;
  body: JavaBlock; // when true, print @interface instead of interface
  extends?: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.InterfaceDeclaration;
  modifiers?: ReadonlyArray<string>;
  name: string;
  typeParameters?: ReadonlyArray<JavaTypeParameter>;
}

export function createInterfaceDeclaration(
  name: string,
  members: ReadonlyArray<JavaInterfaceMember> = [],
  modifiers?: ReadonlyArray<string>,
  annotations?: ReadonlyArray<JavaExpression>,
  extendsExprs?: ReadonlyArray<JavaExpression>,
  annotationInterface?: boolean,
  typeParameters?: ReadonlyArray<JavaTypeParameter>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaInterfaceDeclaration {
  return {
    annotationInterface,
    annotations,
    body: createBlock(members), // Cast to allow interface members as statements
    extends: extendsExprs,
    kind: JavaNodeKind.InterfaceDeclaration,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    typeParameters,
  };
}
