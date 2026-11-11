import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftDictionaryType extends SwiftNodeBase {
  key: SwiftType;
  kind: SwiftNodeKind.DictionaryType;
  value: SwiftType;
}

export function createDictionaryType(
  key: SwiftType,
  value: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDictionaryType {
  return {
    key,
    kind: SwiftNodeKind.DictionaryType,
    leadingComments,
    trailingComments,
    value,
  };
}
