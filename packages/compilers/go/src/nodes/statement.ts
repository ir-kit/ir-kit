import type { GoConstDeclaration } from './declarations/const';
import type { GoFunctionDeclaration } from './declarations/function';
import type { GoShortVarDeclaration } from './declarations/short-var';
import type { GoTypeDeclaration } from './declarations/type';
import type { GoVarDeclaration } from './declarations/var';
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
import type { GoIfStatement } from './statements/if';
import type { GoImportStatement } from './statements/import';
import type { GoIncDecStatement } from './statements/inc-dec';
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
  | GoConstDeclaration
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
  | GoIfStatement
  | GoImportStatement
  | GoIncDecStatement
  | GoReturnStatement
  | GoSelectStatement
  | GoSendStatement
  | GoShortVarDeclaration
  | GoSwitchStatement
  | GoTypeDeclaration
  | GoVarDeclaration;
