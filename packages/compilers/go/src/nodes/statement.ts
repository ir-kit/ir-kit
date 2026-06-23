import type { GoConstDeclaration } from './declarations/const';
import type { GoFunctionDeclaration } from './declarations/function';
import type { GoFunctionParameter } from './declarations/function-parameter';
import type { GoFunctionReturn } from './declarations/function-return';
import type { GoReceiver } from './declarations/receiver';
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
import type { GoShortVarDeclaration } from './statements/short-var';
import type { GoFallthroughStatement, GoSwitchStatement } from './statements/switch';
import type { GoComment } from './structure/comment';

export type GoStatement =
  | GoAssignment
  | GoReturnStatement
  | GoShortVarDeclaration
  | GoConstDeclaration
  | GoFunctionDeclaration
  | GoVarDeclaration
  | GoIfStatement
  | GoForStatement
  | GoIncDecStatement
  | GoExpressionStatement
  | GoForRangeStatement
  | GoContinueStatement
  | GoBreakStatement
  | GoImportStatement
  | GoAugmentAssignment
  | GoTypeDeclaration
  | GoFunctionParameter
  | GoReceiver
  | GoFunctionReturn
  | GoSwitchStatement
  | GoFallthroughStatement
  | GoGoStatement
  | GoDeferStatement
  | GoEmptyStatement
  | GoComment;
