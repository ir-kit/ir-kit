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
import { createSliceExpression } from './expressions/slice';
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
import { createIfStatement } from './statements/if';
import { createImportStatement } from './statements/import';
import { createIncDecStatement } from './statements/inc-dec';
import { createReturnStatement } from './statements/return';
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
import { createInterfaceType } from './types/interface-type';
import { createMapType } from './types/map-type';
import { createPointerType } from './types/pointer-type';
import { createStructType } from './types/struct-type';

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
  createGoStatement,
  createIdentifier,
  createIfStatement,
  createImportStatement,
  createIncDecStatement,
  createIndexExpression,
  createInterfaceType,
  createKeyValueExpression,
  createLiteral,
  createMapType,
  createMemberExpression,
  createPointerType,
  createReturnStatement,
  createSendStatement,
  createShortVarDeclaration,
  createSliceExpression,
  createSourceFile,
  createStructType,
  createSwitchCase,
  createSwitchStatement,
  createTypeDeclaration,
  createUnaryExpression,
  createVarDeclaration,
} as const;
