import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftIdentifierType extends SwiftNodeBase {
  genericArguments?: ReadonlyArray<SwiftType>;
  kind: SwiftNodeKind.IdentifierType;
  name: string;
}

export function createIdentifierType(
  name: string,
  genericArguments?: ReadonlyArray<SwiftType>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIdentifierType {
  return {
    genericArguments,
    kind: SwiftNodeKind.IdentifierType,
    leadingComments,
    name,
    trailingComments,
  };
}
