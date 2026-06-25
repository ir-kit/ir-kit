import { createConstDeclaration } from './declarations/const';
import { createFunctionDeclaration } from './declarations/function';
import { createFunctionParameter } from './declarations/function-parameter';
import { createFunctionReturn } from './declarations/function-return';
import { createReceiver } from './declarations/receiver';
import { createTypeDeclaration } from './declarations/type';
import { createVarDeclaration } from './declarations/var';
import { createIndexExpression } from './expressions';
import { createArrayType } from './expressions/array-type';
import { createBinaryExpression } from './expressions/binary';
import { createCallExpression } from './expressions/call';
import { createCompositeLiteral } from './expressions/composite-literal';
import { createIdentifier } from './expressions/identifier';
import { createInterfaceType } from './expressions/interface';
import { createKeyValueExpression } from './expressions/key-value';
import { createLiteral } from './expressions/literal';
import { createMapType } from './expressions/map-type';
import { createMemberExpression } from './expressions/member';
import { createPointerType } from './expressions/pointer-type';
import { createSliceExpression } from './expressions/slice';
import { createStructType } from './expressions/struct';
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
import { createShortVarDeclaration } from './statements/short-var';
import {
  createFallthroughStatement,
  createSwitchCase,
  createSwitchStatement,
} from './statements/switch';
import { createComment } from './structure/comment';
import { createSourceFile } from './structure/source-file';

export const factory = {
  createArrayType,
  createAssignment,
  createAugmentAssignment,
  createBinaryExpression,
  createBlock,
  createBreakStatement,
  createCallExpression,
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
  createFunctionParameter,
  createFunctionReturn,
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
  createReceiver,
  createReturnStatement,
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
