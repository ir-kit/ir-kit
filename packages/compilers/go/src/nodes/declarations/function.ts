import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";
import type { GoBlock } from "../statements/block.js";
import { createBlock } from "../statements/block.js";
import type { GoType } from "../type.js";
import type { GoFunctionParameter } from "../types/function-parameter.js";
import { type GoFunctionReturn } from "../types/function-return.js";
import type { GoTypeParameter } from "./type-parameter.js";

export type GoReceiverField = {
  name: string;
  type: GoType;
};

export interface GoFunctionDeclaration extends GoNodeBase {
  body: GoBlock;
  kind: GoNodeKind.FunctionDeclaration;
  name: string;
  parameters: ReadonlyArray<GoFunctionParameter>;
  receiver?: GoReceiverField;
  returnType: ReadonlyArray<GoFunctionReturn>;
  typeParameters?: ReadonlyArray<GoTypeParameter>;
}

export function createFunctionDeclaration(
  receiver: GoReceiverField | undefined,
  name: string,
  typeParameters: ReadonlyArray<GoTypeParameter> | undefined,
  parameters: ReadonlyArray<GoFunctionParameter> | undefined,
  returnType: ReadonlyArray<GoFunctionReturn> | undefined,
  body: ReadonlyArray<GoStatement> | undefined,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFunctionDeclaration {
  return {
    body: createBlock(body ?? []),
    kind: GoNodeKind.FunctionDeclaration,
    leadingComments,
    name,
    parameters: parameters ?? [],
    receiver,
    returnType: returnType ?? [],
    trailingComments,
    typeParameters,
  };
}
