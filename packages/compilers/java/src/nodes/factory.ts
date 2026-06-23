import { createClassDeclaration } from './declarations/class';
import { createEnumDeclaration } from './declarations/enum';
import { createInterfaceDeclaration } from './declarations/interface';
import { createMethodDeclaration } from './declarations/method';
import { createMethodParameter } from './declarations/method-parameter';
import { createVariableDeclaration } from './declarations/variable';
import { createAnnotation } from './expressions/annotation';
import { createArrayCreationExpression } from './expressions/array-creation';
import { createArrayInitializer } from './expressions/array-initializer';
import { createBinaryExpression } from './expressions/binary';
import { createCallExpression } from './expressions/call';
import { createCastExpression } from './expressions/cast';
import { createIdentifier } from './expressions/identifier';
import { createIndexExpression } from './expressions/index';
import { createInstanceOfExpression } from './expressions/instanceof';
import { createLambdaExpression } from './expressions/lambda';
import { createLiteral } from './expressions/literal';
import { createMemberExpression } from './expressions/member';
import { createMethodReferenceExpression } from './expressions/method-reference';
import { createNewAnonymousClassExpression, createNewExpression } from './expressions/new';
import { createSuperExpression } from './expressions/super';
import { createSwitchExpression, createSwitchRule } from './expressions/switch';
import { createTernaryExpression } from './expressions/ternary';
import { createThisExpression } from './expressions/this';
import {
  createArrayType,
  createParameterizedType,
  createTypeParameter,
  createWildcardTypeArgument,
} from './expressions/type';
import { createUnaryExpression } from './expressions/unary';
import { createAssertStatement } from './statements/assert';
import { createAssignment, createAugmentedAssignment } from './statements/assignment';
import { createBlock } from './statements/block';
import { createBreakStatement } from './statements/break';
import { createContinueStatement } from './statements/continue';
import { createDoWhileStatement } from './statements/dowhile';
import { createEmptyStatement } from './statements/empty';
import { createExpressionStatement } from './statements/expression';
import { createEnhancedForStatement, createForStatement } from './statements/for';
import { createIfStatement } from './statements/if';
import { createImportStatement } from './statements/import';
import { createLabeledStatement } from './statements/labeled';
import { createReturnStatement } from './statements/return';
import { createSwitchCase, createSwitchStatement } from './statements/switch';
import { createSynchronizedStatement } from './statements/synchronized';
import { createThrowStatement } from './statements/throw';
import { createCatchClause, createTryStatement } from './statements/try';
import { createWhileStatement } from './statements/while';
import { createYieldStatement } from './statements/yield';
import { createComment } from './structure/comment';
import { createPackageDeclaration } from './structure/package';
import { createSourceFile } from './structure/source-file';

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
