import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "./block.js";

export interface JavaCatchClause {
  body: JavaBlock;
  parameterName: string;
  parameterType?: string;
}

/** A `try (Type name = initializer)` resource declaration. */
export interface JavaTryResource {
  initializer?: JavaExpression;
  name: string;
  type: JavaExpression;
}

export interface JavaTryStatement extends JavaNodeBase {
  catchClauses?: ReadonlyArray<JavaCatchClause>;
  finallyBlock?: JavaBlock;
  kind: JavaNodeKind.TryStatement;
  resources?: ReadonlyArray<JavaTryResource | JavaExpression>;
  tryBlock: JavaBlock;
}

export function createCatchClause(
  parameterName: string,
  body: ReadonlyArray<JavaStatement>,
  parameterType?: string,
): JavaCatchClause {
  return {
    body: createBlock(body),
    parameterName,
    parameterType,
  };
}

export function createTryStatement(
  tryBlock: ReadonlyArray<JavaStatement>,
  catchClauses?: ReadonlyArray<JavaCatchClause>,
  finallyBlock?: ReadonlyArray<JavaStatement>,
  resources?: ReadonlyArray<JavaTryResource | JavaExpression>,
): JavaTryStatement {
  return {
    catchClauses,
    finallyBlock: finallyBlock ? createBlock(finallyBlock) : undefined,
    kind: JavaNodeKind.TryStatement,
    resources,
    tryBlock: createBlock(tryBlock),
  };
}
