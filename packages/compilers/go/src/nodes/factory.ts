import { createFunctionDeclaration } from "./declarations/function.js";
import { createShortVarDeclaration } from "./declarations/short-var.js";
import { createTypeDeclaration } from "./declarations/type.js";
import { createTypeSpec } from "./declarations/type-spec.js";
import { createVariableDeclaration } from "./declarations/variable-declaration.js";
import { createVariableDeclarationList } from "./declarations/variable-declaration-list.js";
import { createVariableStatement } from "./declarations/variable-statement.js";
import { createBinaryExpression } from "./expressions/binary.js";
import { createCallExpression } from "./expressions/call.js";
import { createCompositeLiteral } from "./expressions/composite-literal.js";
import { createFunctionLiteral } from "./expressions/function-literal.js";
import { createIdentifier } from "./expressions/identifier.js";
import { createIndexExpression } from "./expressions/index.js";
import { createKeyValueExpression } from "./expressions/key-value.js";
import { createLiteral } from "./expressions/literal.js";
import { createMemberExpression } from "./expressions/member.js";
import { createParenthesizedExpression } from "./expressions/parenthesized.js";
import { createSliceExpression } from "./expressions/slice.js";
import { createTypeAssertExpression } from "./expressions/type-assert.js";
import { createUnaryExpression } from "./expressions/unary.js";
import { createAssignment } from "./statements/assignment.js";
import { createAugmentAssignment } from "./statements/augment-assignment.js";
import { createBlock } from "./statements/block.js";
import { createBreakStatement } from "./statements/break.js";
import { createContinueStatement } from "./statements/continue.js";
import { createDeferStatement } from "./statements/defer.js";
import { createEmptyStatement } from "./statements/empty.js";
import { createExpressionStatement } from "./statements/expression.js";
import { createForStatement } from "./statements/for.js";
import { createForRangeStatement } from "./statements/for-range.js";
import { createGoStatement } from "./statements/go.js";
import { createGotoStatement } from "./statements/goto.js";
import { createIfStatement } from "./statements/if.js";
import { createImportStatement } from "./statements/import.js";
import { createIncDecStatement } from "./statements/inc-dec.js";
import { createLabeledStatement } from "./statements/labeled.js";
import { createReturnStatement } from "./statements/return.js";
import {
  createSelectCase,
  createSelectStatement,
} from "./statements/select.js";
import { createSendStatement } from "./statements/send.js";
import {
  createFallthroughStatement,
  createSwitchCase,
  createSwitchStatement,
} from "./statements/switch.js";
import { createComment } from "./structure/comment.js";
import { createSourceFile } from "./structure/source-file.js";
import { createArrayType } from "./types/array-type.js";
import { createChannelType } from "./types/channel-type.js";
import { createFunctionParameter } from "./types/function-parameter.js";
import { createFunctionReturn } from "./types/function-return.js";
import { createFunctionType } from "./types/function-type.js";
import { createGenericType } from "./types/generic-type.js";
import { createInterfaceType } from "./types/interface-type.js";
import { createMapType } from "./types/map-type.js";
import { createPointerType } from "./types/pointer-type.js";
import { createStructType } from "./types/struct-type.js";
import { createTypeSet } from "./types/type-set.js";

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
  createTypeSpec,
  createUnaryExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
} as const;
