import type { GoFunctionDeclaration } from "./declarations/function.js";
import type { GoShortVarDeclaration } from "./declarations/short-var.js";
import type { GoTypeDeclaration } from "./declarations/type.js";
import type { GoTypeSpec } from "./declarations/type-spec.js";
import type { GoVariableDeclaration } from "./declarations/variable-declaration.js";
import type { GoVariableDeclarationList } from "./declarations/variable-declaration-list.js";
import type { GoVariableStatement } from "./declarations/variable-statement.js";
import type { GoAssignment } from "./statements/assignment.js";
import type { GoAugmentAssignment } from "./statements/augment-assignment.js";
import type { GoBreakStatement } from "./statements/break.js";
import type { GoContinueStatement } from "./statements/continue.js";
import type { GoDeferStatement } from "./statements/defer.js";
import type { GoEmptyStatement } from "./statements/empty.js";
import type { GoExpressionStatement } from "./statements/expression.js";
import type { GoForStatement } from "./statements/for.js";
import type { GoForRangeStatement } from "./statements/for-range.js";
import type { GoGoStatement } from "./statements/go.js";
import type { GoGotoStatement } from "./statements/goto.js";
import type { GoIfStatement } from "./statements/if.js";
import type { GoImportStatement } from "./statements/import.js";
import type { GoIncDecStatement } from "./statements/inc-dec.js";
import type { GoLabeledStatement } from "./statements/labeled.js";
import type { GoReturnStatement } from "./statements/return.js";
import type { GoSelectStatement } from "./statements/select.js";
import type { GoSendStatement } from "./statements/send.js";
import type {
  GoFallthroughStatement,
  GoSwitchStatement,
} from "./statements/switch.js";
import type { GoComment } from "./structure/comment.js";
import type { GoFunctionParameter } from "./types/function-parameter.js";
import type { GoFunctionReturn } from "./types/function-return.js";

export type GoStatement =
  | GoAssignment
  | GoAugmentAssignment
  | GoBreakStatement
  | GoComment
  | GoContinueStatement
  | GoDeferStatement
  | GoEmptyStatement
  | GoExpressionStatement
  | GoFallthroughStatement
  | GoForRangeStatement
  | GoForStatement
  | GoFunctionDeclaration
  | GoFunctionParameter
  | GoFunctionReturn
  | GoGoStatement
  | GoGotoStatement
  | GoIfStatement
  | GoImportStatement
  | GoIncDecStatement
  | GoLabeledStatement
  | GoReturnStatement
  | GoSelectStatement
  | GoSendStatement
  | GoShortVarDeclaration
  | GoSwitchStatement
  | GoTypeDeclaration
  | GoTypeSpec
  | GoVariableDeclaration
  | GoVariableDeclarationList
  | GoVariableStatement;
