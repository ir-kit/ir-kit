import type { GoNodeBase } from '../base';
import type { GoFunctionParameter } from '../declarations/function-parameter';
import type { GoFunctionReturn } from '../declarations/function-return';
import { GoNodeKind } from '../kinds';

export type GoInterfaceField = {
  name: string;
  parameters: ReadonlyArray<GoFunctionParameter>;
  returnType: ReadonlyArray<GoFunctionReturn>;
};

export interface GoInterfaceType extends GoNodeBase {
  fields: ReadonlyArray<GoInterfaceField>;
  kind: GoNodeKind.InterfaceType;
}

export function createInterfaceType(
  fields: ReadonlyArray<GoInterfaceField> | undefined,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoInterfaceType {
  return {
    fields: fields ?? [],
    kind: GoNodeKind.InterfaceType,
    leadingComments,
    trailingComments,
  };
}
