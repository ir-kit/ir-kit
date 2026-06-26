import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import type { GoBlock } from '../statements/block';
import { createBlock } from '../statements/block';
import type { GoType } from '../type';
import type { GoFunctionParameter } from '../types/function-parameter';
import { type GoFunctionReturn } from '../types/function-return';
import type { GoTypeParameter } from './type-parameter';

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
  name: string,
  parameters: ReadonlyArray<GoFunctionParameter> | undefined,
  returnType: ReadonlyArray<GoFunctionReturn> | undefined,
  body: ReadonlyArray<GoStatement> | undefined,
  receiver?: GoReceiverField,
  typeParameters?: ReadonlyArray<GoTypeParameter>,
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
