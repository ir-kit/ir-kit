import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoFunctionParameter } from './function-parameter';
import type { GoFunctionReturn } from './function-return';

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
