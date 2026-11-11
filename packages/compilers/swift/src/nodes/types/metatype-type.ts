import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export type SwiftMetatypeSpecifier = 'Protocol' | 'Type';

export interface SwiftMetatypeType extends SwiftNodeBase {
  baseType: SwiftType;
  kind: SwiftNodeKind.MetatypeType;
  metatypeSpecifier: SwiftMetatypeSpecifier;
}

export function createMetatypeType(
  baseType: SwiftType,
  metatypeSpecifier: SwiftMetatypeSpecifier,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMetatypeType {
  return {
    baseType,
    kind: SwiftNodeKind.MetatypeType,
    leadingComments,
    metatypeSpecifier,
    trailingComments,
  };
}
