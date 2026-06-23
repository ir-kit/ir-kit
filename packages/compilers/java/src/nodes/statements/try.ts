import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import { createBlock, type JavaBlock } from './block';

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
