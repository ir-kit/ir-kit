import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import type { JavaTypeParameter } from "../expressions/type.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import type { JavaBlock } from "../statements/block.js";
import { createBlock } from "../statements/block.js";
import type { JavaMethodDeclaration } from "./method.js";
import type { JavaVariableDeclaration } from "./variable.js";

export type JavaClassMember = JavaMethodDeclaration | JavaVariableDeclaration;

export interface JavaClassDeclaration extends JavaNodeBase {
  annotations?: ReadonlyArray<JavaExpression>;
  body: JavaBlock;
  extends?: JavaExpression;
  implements?: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.ClassDeclaration;
  modifiers?: ReadonlyArray<string>;
  name: string;
  typeParameters?: ReadonlyArray<JavaTypeParameter>;
}

export function createClassDeclaration(
  name: string,
  members: ReadonlyArray<JavaClassMember | JavaStatement>,
  modifiers?: ReadonlyArray<string>,
  annotations?: ReadonlyArray<JavaExpression>,
  extendsExpr?: JavaExpression,
  implementsExprs?: ReadonlyArray<JavaExpression>,
  typeParameters?: ReadonlyArray<JavaTypeParameter>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaClassDeclaration {
  return {
    annotations,
    body: createBlock(members),
    extends: extendsExpr,
    implements: implementsExprs,
    kind: JavaNodeKind.ClassDeclaration,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    typeParameters,
  };
}
