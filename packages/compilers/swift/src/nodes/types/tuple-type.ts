import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export type SwiftTupleTypeElement = {
  firstName?: string;
  type: SwiftType;
};

export interface SwiftTupleType extends SwiftNodeBase {
  elements: ReadonlyArray<SwiftTupleTypeElement>;
  kind: SwiftNodeKind.TupleType;
}

export function createTupleType(
  elements: ReadonlyArray<SwiftTupleTypeElement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTupleType {
  return {
    elements,
    kind: SwiftNodeKind.TupleType,
    leadingComments,
    trailingComments,
  };
}
