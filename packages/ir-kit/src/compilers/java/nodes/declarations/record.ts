import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaBlock } from "../statements/block.js";
import { createBlock } from "../statements/block.js";
import type { JavaClassMember } from "./class.js";
import type { JavaMethodParameter } from "./method-parameter.js";

export interface JavaRecordDeclaration extends JavaNodeBase {
  annotations?: ReadonlyArray<JavaExpression>;
  body: JavaBlock;
  components: ReadonlyArray<JavaMethodParameter>;
  implements?: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.RecordDeclaration;
  modifiers?: ReadonlyArray<string>;
  name: string;
}

export function createRecordDeclaration(
  name: string,
  components: ReadonlyArray<JavaMethodParameter>,
  members: ReadonlyArray<JavaClassMember> = [],
  modifiers?: ReadonlyArray<string>,
  annotations?: ReadonlyArray<JavaExpression>,
  implementsExprs?: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
): JavaRecordDeclaration {
  return {
    annotations,
    body: createBlock(members),
    components,
    implements: implementsExprs,
    kind: JavaNodeKind.RecordDeclaration,
    leadingComments,
    modifiers,
    name,
  };
}
