import type { SwiftEnumCasePattern } from './patterns/enum-case-pattern';
import type { SwiftExpressionPattern } from './patterns/expression-pattern';
import type { SwiftIdentifierPattern } from './patterns/identifier-pattern';
import type { SwiftIsPattern } from './patterns/is-pattern';
import type { SwiftOptionalPattern } from './patterns/optional-pattern';
import type { SwiftTuplePattern } from './patterns/tuple-pattern';
import type { SwiftValueBindingPattern } from './patterns/value-binding-pattern';
import type { SwiftWildcardPattern } from './patterns/wildcard-pattern';

export type SwiftPattern =
  | SwiftEnumCasePattern
  | SwiftExpressionPattern
  | SwiftIdentifierPattern
  | SwiftIsPattern
  | SwiftOptionalPattern
  | SwiftTuplePattern
  | SwiftValueBindingPattern
  | SwiftWildcardPattern;
