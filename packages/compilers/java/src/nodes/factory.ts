import { createClassDeclaration } from "./declarations/class.js";
import { createEnumDeclaration } from "./declarations/enum.js";
import { createInterfaceDeclaration } from "./declarations/interface.js";
import { createMethodDeclaration } from "./declarations/method.js";
import { createMethodParameter } from "./declarations/method-parameter.js";
import { createVariableDeclaration } from "./declarations/variable.js";
import { createAnnotation } from "./expressions/annotation.js";
import { createArrayCreationExpression } from "./expressions/array-creation.js";
import { createArrayInitializer } from "./expressions/array-initializer.js";
import { createBinaryExpression } from "./expressions/binary.js";
import { createCallExpression } from "./expressions/call.js";
import { createCastExpression } from "./expressions/cast.js";
import { createIdentifier } from "./expressions/identifier.js";
import { createIndexExpression } from "./expressions/index.js";
import { createInstanceOfExpression } from "./expressions/instanceof.js";
import { createLambdaExpression } from "./expressions/lambda.js";
import { createLiteral } from "./expressions/literal.js";
import { createMemberExpression } from "./expressions/member.js";
import { createMethodReferenceExpression } from "./expressions/method-reference.js";
import {
  createNewAnonymousClassExpression,
  createNewExpression,
} from "./expressions/new.js";
import { createSuperExpression } from "./expressions/super.js";
import {
  createSwitchExpression,
  createSwitchRule,
} from "./expressions/switch.js";
import { createTernaryExpression } from "./expressions/ternary.js";
import { createThisExpression } from "./expressions/this.js";
import {
  createArrayType,
  createParameterizedType,
  createTypeParameter,
  createWildcardTypeArgument,
} from "./expressions/type.js";
import { createUnaryExpression } from "./expressions/unary.js";
import { createAssertStatement } from "./statements/assert.js";
import {
  createAssignment,
  createAugmentedAssignment,
} from "./statements/assignment.js";
import { createBlock } from "./statements/block.js";
import { createBreakStatement } from "./statements/break.js";
import { createContinueStatement } from "./statements/continue.js";
import { createDoWhileStatement } from "./statements/dowhile.js";
import { createEmptyStatement } from "./statements/empty.js";
import { createExpressionStatement } from "./statements/expression.js";
import {
  createEnhancedForStatement,
  createForStatement,
} from "./statements/for.js";
import { createIfStatement } from "./statements/if.js";
import { createImportStatement } from "./statements/import.js";
import { createLabeledStatement } from "./statements/labeled.js";
import { createReturnStatement } from "./statements/return.js";
import {
  createSwitchCase,
  createSwitchStatement,
} from "./statements/switch.js";
import { createSynchronizedStatement } from "./statements/synchronized.js";
import { createThrowStatement } from "./statements/throw.js";
import { createCatchClause, createTryStatement } from "./statements/try.js";
import { createWhileStatement } from "./statements/while.js";
import { createYieldStatement } from "./statements/yield.js";
import { createComment } from "./structure/comment.js";
import { createPackageDeclaration } from "./structure/package.js";
import { createSourceFile } from "./structure/source-file.js";

export const factory = {
  createAnnotation,
  createArrayCreationExpression,
  createArrayInitializer,
  createArrayType,
  createAssertStatement,
  createAssignment,
  createAugmentedAssignment,
  createBinaryExpression,
  createBlock,
  createBreakStatement,
  createCallExpression,
  createCastExpression,
  createCatchClause,
  createClassDeclaration,
  createComment,
  createContinueStatement,
  createDoWhileStatement,
  createEmptyStatement,
  createEnhancedForStatement,
  createEnumDeclaration,
  createExpressionStatement,
  createForStatement,
  createIdentifier,
  createIfStatement,
  createImportStatement,
  createIndexExpression,
  createInstanceOfExpression,
  createInterfaceDeclaration,
  createLabeledStatement,
  createLambdaExpression,
  createLiteral,
  createMemberExpression,
  createMethodDeclaration,
  createMethodParameter,
  createMethodReferenceExpression,
  createNewAnonymousClassExpression,
  createNewExpression,
  createPackageDeclaration,
  createParameterizedType,
  createReturnStatement,
  createSourceFile,
  createSuperExpression,
  createSwitchCase,
  createSwitchExpression,
  createSwitchRule,
  createSwitchStatement,
  createSynchronizedStatement,
  createTernaryExpression,
  createThisExpression,
  createThrowStatement,
  createTryStatement,
  createTypeParameter,
  createUnaryExpression,
  createVariableDeclaration,
  createWhileStatement,
  createWildcardTypeArgument,
  createYieldStatement,
} as const;
