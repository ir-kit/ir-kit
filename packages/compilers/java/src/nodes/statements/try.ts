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

export interface JavaTryStatement extends JavaNodeBase {
  catchClauses?: ReadonlyArray<JavaCatchClause>;
  finallyBlock?: JavaBlock;
  kind: JavaNodeKind.TryStatement;
  resources?: ReadonlyArray<
    | {
        initializer?: JavaExpression;
        name: string;
        type: JavaExpression;
      }
    | JavaExpression
  >;
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
  resources?: ReadonlyArray<
    | {
        initializer?: JavaExpression;
        name: string;
        type: JavaExpression;
      }
    | JavaExpression
  >,
): JavaTryStatement {
  return {
    catchClauses,
    finallyBlock: finallyBlock ? createBlock(finallyBlock) : undefined,
    kind: JavaNodeKind.TryStatement,
    resources,
    tryBlock: createBlock(tryBlock),
  };
}
