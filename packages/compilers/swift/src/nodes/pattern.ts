import type { SwiftEnumCasePattern } from "./patterns/enum-case-pattern.js";
import type { SwiftExpressionPattern } from "./patterns/expression-pattern.js";
import type { SwiftIdentifierPattern } from "./patterns/identifier-pattern.js";
import type { SwiftIsPattern } from "./patterns/is-pattern.js";
import type { SwiftOptionalPattern } from "./patterns/optional-pattern.js";
import type { SwiftTuplePattern } from "./patterns/tuple-pattern.js";
import type { SwiftValueBindingPattern } from "./patterns/value-binding-pattern.js";
import type { SwiftWildcardPattern } from "./patterns/wildcard-pattern.js";

export type SwiftPattern =
  | SwiftEnumCasePattern
  | SwiftExpressionPattern
  | SwiftIdentifierPattern
  | SwiftIsPattern
  | SwiftOptionalPattern
  | SwiftTuplePattern
  | SwiftValueBindingPattern
  | SwiftWildcardPattern;
