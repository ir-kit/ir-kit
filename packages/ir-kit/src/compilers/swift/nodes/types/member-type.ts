import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftMemberType extends SwiftNodeBase {
  baseType: SwiftType;
  kind: SwiftNodeKind.MemberType;
  name: string;
}

export function createMemberType(
  baseType: SwiftType,
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMemberType {
  return {
    baseType,
    kind: SwiftNodeKind.MemberType,
    leadingComments,
    name,
    trailingComments,
  };
}
