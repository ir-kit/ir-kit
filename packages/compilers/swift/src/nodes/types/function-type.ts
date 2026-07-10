import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftFunctionType extends SwiftNodeBase {
  isAsync?: boolean;
  isThrows?: boolean;
  kind: SwiftNodeKind.FunctionType;
  parameters: ReadonlyArray<SwiftType>;
  returnType: SwiftType;
}

export function createFunctionType(
  parameters: ReadonlyArray<SwiftType>,
  returnType: SwiftType,
  isAsync?: boolean,
  isThrows?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftFunctionType {
  return {
    isAsync,
    isThrows,
    kind: SwiftNodeKind.FunctionType,
    leadingComments,
    parameters,
    returnType,
    trailingComments,
  };
}
