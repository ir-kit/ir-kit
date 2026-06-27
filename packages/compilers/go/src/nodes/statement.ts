import type { GoFunctionDeclaration } from './declarations/function';
import type { GoShortVarDeclaration } from './declarations/short-var';
import type { GoTypeDeclaration } from './declarations/type';
import type { GoTypeSpec } from './declarations/type-spec';
import type { GoVariableDeclaration } from './declarations/variable-declaration';
import type { GoVariableDeclarationList } from './declarations/variable-declaration-list';
import type { GoVariableStatement } from './declarations/variable-statement';
import type { GoAssignment } from './statements/assignment';
import type { GoAugmentAssignment } from './statements/augment-assignment';
import type { GoBreakStatement } from './statements/break';
import type { GoContinueStatement } from './statements/continue';
import type { GoDeferStatement } from './statements/defer';
import type { GoEmptyStatement } from './statements/empty';
import type { GoExpressionStatement } from './statements/expression';
import type { GoForStatement } from './statements/for';
import type { GoForRangeStatement } from './statements/for-range';
import type { GoGoStatement } from './statements/go';
import type { GoGotoStatement } from './statements/goto';
import type { GoIfStatement } from './statements/if';
import type { GoImportStatement } from './statements/import';
import type { GoIncDecStatement } from './statements/inc-dec';
import type { GoLabeledStatement } from './statements/labeled';
import type { GoReturnStatement } from './statements/return';
import type { GoSelectStatement } from './statements/select';
import type { GoSendStatement } from './statements/send';
import type { GoFallthroughStatement, GoSwitchStatement } from './statements/switch';
import type { GoComment } from './structure/comment';
import type { GoFunctionParameter } from './types/function-parameter';
import type { GoFunctionReturn } from './types/function-return';

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
