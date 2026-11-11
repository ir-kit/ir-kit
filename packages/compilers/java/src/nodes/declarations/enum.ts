import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import type { JavaBlock } from "../statements/block.js";
import { createBlock } from "../statements/block.js";
import type { JavaMethodDeclaration } from "./method.js";
import type { JavaVariableDeclaration } from "./variable.js";

export interface JavaEnumConstant {
  args?: ReadonlyArray<JavaExpression>;
  name: string;
}

export interface JavaEnumDeclaration extends JavaNodeBase {
  annotations?: ReadonlyArray<JavaExpression>;
  body: JavaBlock;
  constants: ReadonlyArray<JavaEnumConstant>;
  implements?: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.EnumDeclaration;
  modifiers?: ReadonlyArray<string>;
  name: string;
}

export type JavaEnumMember = JavaVariableDeclaration | JavaMethodDeclaration;

export function createEnumDeclaration(
  name: string,
  constants: ReadonlyArray<JavaEnumConstant>,
  members: ReadonlyArray<JavaEnumMember | JavaStatement> = [],
  modifiers?: ReadonlyArray<string>,
  annotations?: ReadonlyArray<JavaExpression>,
  implementsExprs?: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaEnumDeclaration {
  return {
    annotations,
    body: createBlock(members),
    constants,
    implements: implementsExprs,
    kind: JavaNodeKind.EnumDeclaration,
    leadingComments,
    modifiers,
    name,
    trailingComments,
  };
}
