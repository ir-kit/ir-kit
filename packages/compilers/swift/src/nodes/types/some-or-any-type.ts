import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export type SwiftSomeOrAnySpecifier = 'any' | 'some';

export interface SwiftSomeOrAnyType extends SwiftNodeBase {
  baseType: SwiftType;
  kind: SwiftNodeKind.SomeOrAnyType;
  specifier: SwiftSomeOrAnySpecifier;
}

export function createSomeOrAnyType(
  specifier: SwiftSomeOrAnySpecifier,
  baseType: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSomeOrAnyType {
  return {
    baseType,
    kind: SwiftNodeKind.SomeOrAnyType,
    leadingComments,
    specifier,
    trailingComments,
  };
}
