import type { SwiftArrayLiteral } from "./expressions/array-literal.js";
import type { SwiftAsExpression } from "./expressions/as-expression.js";
import type { SwiftAssignmentExpression } from "./expressions/assignment-expression.js";
import type { SwiftAwaitExpression } from "./expressions/await-expression.js";
import type { SwiftBooleanLiteral } from "./expressions/boolean-literal.js";
import type { SwiftClosureExpression } from "./expressions/closure-expression.js";
import type { SwiftDictionaryLiteral } from "./expressions/dictionary-literal.js";
import type { SwiftFloatLiteral } from "./expressions/float-literal.js";
import type { SwiftFunctionCallExpression } from "./expressions/function-call-expression.js";
import type { SwiftIdentifier } from "./expressions/identifier.js";
import type { SwiftInfixOperatorExpression } from "./expressions/infix-operator-expression.js";
import type { SwiftIntegerLiteral } from "./expressions/integer-literal.js";
import type { SwiftInterpolatedStringLiteral } from "./expressions/interpolated-string-literal.js";
import type { SwiftIsExpression } from "./expressions/is-expression.js";
import type { SwiftKeyPathExpression } from "./expressions/key-path-expression.js";
import type { SwiftMacroExpansionExpression } from "./expressions/macro-expansion-expression.js";
import type { SwiftMemberAccessExpression } from "./expressions/member-access-expression.js";
import type { SwiftMultilineStringLiteral } from "./expressions/multiline-string-literal.js";
import type { SwiftNilLiteral } from "./expressions/nil-literal.js";
import type { SwiftPostfixOperatorExpression } from "./expressions/postfix-operator-expression.js";
import type { SwiftPrefixOperatorExpression } from "./expressions/prefix-operator-expression.js";
import type { SwiftRangeExpression } from "./expressions/range-expression.js";
import type { SwiftRegexLiteral } from "./expressions/regex-literal.js";
import type { SwiftSelectorExpression } from "./expressions/selector-expression.js";
import type { SwiftSelfExpression } from "./expressions/self-expression.js";
import type { SwiftStringLiteral } from "./expressions/string-literal.js";
import type { SwiftSubscriptExpression } from "./expressions/subscript-expression.js";
import type { SwiftSuperExpression } from "./expressions/super-expression.js";
import type { SwiftTernaryExpression } from "./expressions/ternary-expression.js";
import type { SwiftTryExpression } from "./expressions/try-expression.js";
import type { SwiftTupleExpression } from "./expressions/tuple-expression.js";

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
