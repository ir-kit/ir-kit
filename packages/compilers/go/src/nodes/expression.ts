import type { GoBinaryExpression } from "./expressions/binary.js";
import type { GoCallExpression } from "./expressions/call.js";
import type { GoCompositeLiteral } from "./expressions/composite-literal.js";
import type { GoFunctionLiteral } from "./expressions/function-literal.js";
import type { GoIdentifier } from "./expressions/identifier.js";
import type { GoIndexExpression } from "./expressions/index.js";
import type { GoKeyValueExpression } from "./expressions/key-value.js";
import type { GoLiteral } from "./expressions/literal.js";
import type { GoMemberExpression } from "./expressions/member.js";
import type { GoParenthesizedExpression } from "./expressions/parenthesized.js";
import type { GoSliceExpression } from "./expressions/slice.js";
import type { GoTypeAssertExpression } from "./expressions/type-assert.js";
import type { GoUnaryExpression } from "./expressions/unary.js";

export type GoExpression =
  | GoBinaryExpression
  | GoCallExpression
  | GoCompositeLiteral
  | GoFunctionLiteral
  | GoIdentifier
  | GoIndexExpression
  | GoKeyValueExpression
  | GoLiteral
  | GoMemberExpression
  | GoParenthesizedExpression
  | GoSliceExpression
  | GoTypeAssertExpression
  | GoUnaryExpression;
