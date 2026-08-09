import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

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
