import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export type SwiftSomeOrAnySpecifier = "any" | "some";

export interface SwiftSomeOrAnyType extends SwiftNodeBase {
  constraint: SwiftType;
  kind: SwiftNodeKind.SomeOrAnyType;
  someOrAnySpecifier: SwiftSomeOrAnySpecifier;
}

export function createSomeOrAnyType(
  someOrAnySpecifier: SwiftSomeOrAnySpecifier,
  constraint: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSomeOrAnyType {
  return {
    constraint,
    kind: SwiftNodeKind.SomeOrAnyType,
    leadingComments,
    someOrAnySpecifier,
    trailingComments,
  };
}
