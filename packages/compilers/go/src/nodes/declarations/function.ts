import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import type { GoBlock } from '../statements/block';
import { createBlock } from '../statements/block';
import type { GoFunctionParameter } from './function-parameter';
import { type GoFunctionReturn } from './function-return';
import type { GoReceiver } from './receiver';

export interface GoFunctionDeclaration extends GoNodeBase {
  body: GoBlock;
  kind: GoNodeKind.FunctionDeclaration;
  name: string | undefined;
  parameters: ReadonlyArray<GoFunctionParameter>;
  receiver?: GoReceiver;
  returnType: ReadonlyArray<GoFunctionReturn>;
}

export function createFunctionDeclaration(
  name: string | undefined,
  parameters: ReadonlyArray<GoFunctionParameter> | undefined,
  returnType: ReadonlyArray<GoFunctionReturn> | undefined,
  body: ReadonlyArray<GoStatement> | undefined,
  receiver?: GoReceiver,
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
  };
}
