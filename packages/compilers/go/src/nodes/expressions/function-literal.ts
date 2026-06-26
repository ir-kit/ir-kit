import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import type { GoBlock } from '../statements/block';
import { createBlock } from '../statements/block';
import type { GoFunctionParameter } from '../types/function-parameter';
import type { GoFunctionReturn } from '../types/function-return';

export interface GoFunctionLiteral extends GoNodeBase {
  body: GoBlock;
  kind: GoNodeKind.FunctionLiteral;
  parameters: ReadonlyArray<GoFunctionParameter>;
  returnType: ReadonlyArray<GoFunctionReturn>;
}

export function createFunctionLiteral(
  parameters: ReadonlyArray<GoFunctionParameter> | undefined,
  returnType: ReadonlyArray<GoFunctionReturn> | undefined,
  body: ReadonlyArray<GoStatement> | undefined,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFunctionLiteral {
  return {
    body: createBlock(body ?? []),
    kind: GoNodeKind.FunctionLiteral,
    leadingComments,
    parameters: parameters ?? [],
    returnType: returnType ?? [],
    trailingComments,
  };
}
