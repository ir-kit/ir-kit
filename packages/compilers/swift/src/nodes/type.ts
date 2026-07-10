import type { SwiftArrayType } from './types/array-type';
import type { SwiftCompositionType } from './types/composition-type';
import type { SwiftDictionaryType } from './types/dictionary-type';
import type { SwiftFunctionType } from './types/function-type';
import type { SwiftIdentifierType } from './types/identifier-type';
import type { SwiftImplicitlyUnwrappedOptionalType } from './types/implicitly-unwrapped-optional-type';
import type { SwiftMemberType } from './types/member-type';
import type { SwiftMetatypeType } from './types/metatype-type';
import type { SwiftOptionalType } from './types/optional-type';
import type { SwiftPackElementType } from './types/pack-element-type';
import type { SwiftPackExpansionType } from './types/pack-expansion-type';
import type { SwiftSomeOrAnyType } from './types/some-or-any-type';
import type { SwiftTupleType } from './types/tuple-type';

export type SwiftType =
  | SwiftArrayType
  | SwiftCompositionType
  | SwiftDictionaryType
  | SwiftFunctionType
  | SwiftIdentifierType
  | SwiftImplicitlyUnwrappedOptionalType
  | SwiftMemberType
  | SwiftMetatypeType
  | SwiftOptionalType
  | SwiftPackElementType
  | SwiftPackExpansionType
  | SwiftSomeOrAnyType
  | SwiftTupleType;
