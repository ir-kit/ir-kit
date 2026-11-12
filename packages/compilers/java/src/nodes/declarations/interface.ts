import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import type { JavaTypeParameter } from "../expressions/type.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaBlock } from "../statements/block.js";
import { createBlock } from "../statements/block.js";
import type { JavaMethodDeclaration } from "./method.js";
import type { JavaVariableDeclaration } from "./variable.js";

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
  permits?: ReadonlyArray<JavaExpression>;
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
  permits?: ReadonlyArray<JavaExpression>,
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
    permits,
    trailingComments,
    typeParameters,
  };
}
