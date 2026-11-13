import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

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
