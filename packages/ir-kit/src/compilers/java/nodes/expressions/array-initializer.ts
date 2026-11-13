import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaArrayInitializer extends JavaNodeBase {
  elements: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.ArrayInitializer;
}

export function createArrayInitializer(
  elements?: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaArrayInitializer {
  return {
    elements: elements ?? [],
    kind: JavaNodeKind.ArrayInitializer,
    leadingComments,
    trailingComments,
  };
}
