import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoFunctionReturn } from "./function-return.js";

export interface GoFunctionType extends GoNodeBase {
  kind: GoNodeKind.FunctionType;
  parameters: ReadonlyArray<GoExpression>;
  returnType: ReadonlyArray<GoFunctionReturn>;
}

export function createFunctionType(
  parameters: ReadonlyArray<GoExpression> | undefined,
  returnType: ReadonlyArray<GoFunctionReturn> | undefined,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFunctionType {
  return {
    kind: GoNodeKind.FunctionType,
    leadingComments,
    parameters: parameters ?? [],
    returnType: returnType ?? [],
    trailingComments,
  };
}
