import type { SwiftArrayType } from "./types/array-type.js";
import type { SwiftCompositionType } from "./types/composition-type.js";
import type { SwiftDictionaryType } from "./types/dictionary-type.js";
import type { SwiftFunctionType } from "./types/function-type.js";
import type { SwiftIdentifierType } from "./types/identifier-type.js";
import type { SwiftImplicitlyUnwrappedOptionalType } from "./types/implicitly-unwrapped-optional-type.js";
import type { SwiftMemberType } from "./types/member-type.js";
import type { SwiftMetatypeType } from "./types/metatype-type.js";
import type { SwiftOptionalType } from "./types/optional-type.js";
import type { SwiftPackElementType } from "./types/pack-element-type.js";
import type { SwiftPackExpansionType } from "./types/pack-expansion-type.js";
import type { SwiftSomeOrAnyType } from "./types/some-or-any-type.js";
import type { SwiftTupleType } from "./types/tuple-type.js";

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
