import type { SwiftArrayLiteral } from './expressions/array-literal';
import type { SwiftAsExpression } from './expressions/as-expression';
import type { SwiftAssignmentExpression } from './expressions/assignment-expression';
import type { SwiftAwaitExpression } from './expressions/await-expression';
import type { SwiftBooleanLiteral } from './expressions/boolean-literal';
import type { SwiftClosureExpression } from './expressions/closure-expression';
import type { SwiftDictionaryLiteral } from './expressions/dictionary-literal';
import type { SwiftFloatLiteral } from './expressions/float-literal';
import type { SwiftFunctionCallExpression } from './expressions/function-call-expression';
import type { SwiftIdentifier } from './expressions/identifier';
import type { SwiftInfixOperatorExpression } from './expressions/infix-operator-expression';
import type { SwiftIntegerLiteral } from './expressions/integer-literal';
import type { SwiftInterpolatedStringLiteral } from './expressions/interpolated-string-literal';
import type { SwiftIsExpression } from './expressions/is-expression';
import type { SwiftKeyPathExpression } from './expressions/key-path-expression';
import type { SwiftMacroExpansionExpression } from './expressions/macro-expansion-expression';
import type { SwiftMemberAccessExpression } from './expressions/member-access-expression';
import type { SwiftMultilineStringLiteral } from './expressions/multiline-string-literal';
import type { SwiftNilLiteral } from './expressions/nil-literal';
import type { SwiftPostfixOperatorExpression } from './expressions/postfix-operator-expression';
import type { SwiftPrefixOperatorExpression } from './expressions/prefix-operator-expression';
import type { SwiftRangeExpression } from './expressions/range-expression';
import type { SwiftRegexLiteral } from './expressions/regex-literal';
import type { SwiftSelectorExpression } from './expressions/selector-expression';
import type { SwiftSelfExpression } from './expressions/self-expression';
import type { SwiftStringLiteral } from './expressions/string-literal';
import type { SwiftSubscriptExpression } from './expressions/subscript-expression';
import type { SwiftSuperExpression } from './expressions/super-expression';
import type { SwiftTernaryExpression } from './expressions/ternary-expression';
import type { SwiftTryExpression } from './expressions/try-expression';
import type { SwiftTupleExpression } from './expressions/tuple-expression';

export type SwiftExpression =
  | SwiftArrayLiteral
  | SwiftAsExpression
  | SwiftAssignmentExpression
  | SwiftAwaitExpression
  | SwiftBooleanLiteral
  | SwiftClosureExpression
  | SwiftDictionaryLiteral
  | SwiftFloatLiteral
  | SwiftFunctionCallExpression
  | SwiftIdentifier
  | SwiftInfixOperatorExpression
  | SwiftIntegerLiteral
  | SwiftInterpolatedStringLiteral
  | SwiftIsExpression
  | SwiftKeyPathExpression
  | SwiftMacroExpansionExpression
  | SwiftMemberAccessExpression
  | SwiftMultilineStringLiteral
  | SwiftNilLiteral
  | SwiftPostfixOperatorExpression
  | SwiftPrefixOperatorExpression
  | SwiftRangeExpression
  | SwiftRegexLiteral
  | SwiftSelectorExpression
  | SwiftSelfExpression
  | SwiftStringLiteral
  | SwiftSubscriptExpression
  | SwiftSuperExpression
  | SwiftTernaryExpression
  | SwiftTryExpression
  | SwiftTupleExpression;
