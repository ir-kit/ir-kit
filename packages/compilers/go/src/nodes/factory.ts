import { createConstDeclaration } from './declarations/const';
import { createFunctionDeclaration } from './declarations/function';
import { createShortVarDeclaration } from './declarations/short-var';
import { createTypeDeclaration } from './declarations/type';
import { createVarDeclaration } from './declarations/var';
import { createIndexExpression } from './expressions';
import { createBinaryExpression } from './expressions/binary';
import { createCallExpression } from './expressions/call';
import { createCompositeLiteral } from './expressions/composite-literal';
import { createFunctionLiteral } from './expressions/function-literal';
import { createIdentifier } from './expressions/identifier';
import { createKeyValueExpression } from './expressions/key-value';
import { createLiteral } from './expressions/literal';
import { createMemberExpression } from './expressions/member';
import { createParenthesizedExpression } from './expressions/parenthesized';
import { createSliceExpression } from './expressions/slice';
import { createTypeAssertExpression } from './expressions/type-assert';
import { createUnaryExpression } from './expressions/unary';
import { createAssignment } from './statements/assignment';
import { createAugmentAssignment } from './statements/augment-assignment';
import { createBlock } from './statements/block';
import { createBreakStatement } from './statements/break';
import { createContinueStatement } from './statements/continue';
import { createDeferStatement } from './statements/defer';
import { createEmptyStatement } from './statements/empty';
import { createExpressionStatement } from './statements/expression';
import { createForStatement } from './statements/for';
import { createForRangeStatement } from './statements/for-range';
import { createGoStatement } from './statements/go';
import { createGotoStatement } from './statements/goto';
import { createIfStatement } from './statements/if';
import { createImportStatement } from './statements/import';
import { createIncDecStatement } from './statements/inc-dec';
import { createLabeledStatement } from './statements/labeled';
import { createReturnStatement } from './statements/return';
import { createSelectCase, createSelectStatement } from './statements/select';
import { createSendStatement } from './statements/send';
import {
  createFallthroughStatement,
  createSwitchCase,
  createSwitchStatement,
} from './statements/switch';
import { createComment } from './structure/comment';
import { createSourceFile } from './structure/source-file';
import { createArrayType } from './types/array-type';
import { createChannelType } from './types/channel-type';
import { createFunctionParameter } from './types/function-parameter';
import { createFunctionReturn } from './types/function-return';
import { createFunctionType } from './types/function-type';
import { createGenericType } from './types/generic-type';
import { createInterfaceType } from './types/interface-type';
import { createMapType } from './types/map-type';
import { createPointerType } from './types/pointer-type';
import { createStructType } from './types/struct-type';
import { createTypeSet } from './types/type-set';

export const factory = {
  createArrayType,
  createAssignment,
  createAugmentAssignment,
  createBinaryExpression,
  createBlock,
  createBreakStatement,
  createCallExpression,
  createChannelType,
  createComment,
  createCompositeLiteral,
  createConstDeclaration,
  createContinueStatement,
  createDeferStatement,
  createEmptyStatement,
  createExpressionStatement,
  createFallthroughStatement,
  createForRangeStatement,
  createForStatement,
  createFunctionDeclaration,
  createFunctionLiteral,
  createFunctionParameter,
  createFunctionReturn,
  createFunctionType,
  createGenericType,
  createGoStatement,
  createGotoStatement,
  createIdentifier,
  createIfStatement,
  createImportStatement,
  createIncDecStatement,
  createIndexExpression,
  createInterfaceType,
  createKeyValueExpression,
  createLabeledStatement,
  createLiteral,
  createMapType,
  createMemberExpression,
  createParenthesizedExpression,
  createPointerType,
  createReturnStatement,
  createSelectCase,
  createSelectStatement,
  createSendStatement,
  createShortVarDeclaration,
  createSliceExpression,
  createSourceFile,
  createStructType,
  createSwitchCase,
  createSwitchStatement,
  createTypeAssertExpression,
  createTypeDeclaration,
  createTypeSet,
  createUnaryExpression,
  createVarDeclaration,
} as const;
