import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

export type GoChannelDirection = "receive" | "send";

export interface GoChannelType extends GoNodeBase {
  direction?: GoChannelDirection;
  elementType: GoType;
  kind: GoNodeKind.ChannelType;
}

export function createChannelType(
  elementType: GoType,
  direction?: GoChannelDirection,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoChannelType {
  return {
    direction,
    elementType,
    kind: GoNodeKind.ChannelType,
    leadingComments,
    trailingComments,
  };
}
