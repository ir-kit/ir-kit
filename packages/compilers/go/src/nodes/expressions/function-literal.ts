import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";
import type { GoBlock } from "../statements/block.js";
import { createBlock } from "../statements/block.js";
import type { GoFunctionParameter } from "../types/function-parameter.js";
import type { GoFunctionReturn } from "../types/function-return.js";

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
