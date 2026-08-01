import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinFunctionTypeParameter } from '../shared';
import type { KotlinType } from '../type';

export interface KotlinFunctionType extends KotlinNodeBase {
  kind: KotlinNodeKind.FunctionType;
  parameters: ReadonlyArray<KotlinFunctionTypeParameter>;
  receiver?: KotlinType;
  returnType: KotlinType;
}

export function createFunctionType(
  parameters: ReadonlyArray<KotlinFunctionTypeParameter>,
  returnType: KotlinType,
  receiver?: KotlinType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinFunctionType {
  return {
    kind: KotlinNodeKind.FunctionType,
    leadingComments,
    parameters,
    receiver,
    returnType,
    trailingComments,
  };
}
