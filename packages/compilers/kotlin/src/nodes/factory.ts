import { createAnnotation } from './declarations/annotation';
import { createClassDeclaration } from './declarations/class';
import { createEnumEntry } from './declarations/enum-entry';
import { createFunctionDeclaration } from './declarations/function';
import { createInitBlock } from './declarations/init-block';
import { createObjectDeclaration } from './declarations/object';
import { createParameter } from './declarations/parameter';
import { createPrimaryConstructor } from './declarations/primary-constructor';
import { createProperty } from './declarations/property';
import { createTypeAlias } from './declarations/type-alias';
import { createAsExpression } from './expressions/as-expression';
import { createBinaryExpression } from './expressions/binary';
import { createCallExpression } from './expressions/call';
import { createCallableReference } from './expressions/callable-reference';
import { createElvisExpression } from './expressions/elvis';
import { createIdentifier } from './expressions/identifier';
import { createIfExpression } from './expressions/if';
import { createIndexingExpression } from './expressions/indexing-expression';
import { createIsExpression } from './expressions/is-expression';
import { createLambdaExpression } from './expressions/lambda';
import { createLiteral } from './expressions/literal';
import { createNavigationExpression } from './expressions/navigation';
import { createParenthesizedExpression } from './expressions/parenthesized';
import { createPostfixUnaryExpression } from './expressions/postfix-unary';
import { createPrefixUnaryExpression } from './expressions/prefix-unary';
import { createStringLiteral } from './expressions/string-literal';
import { createSuperExpression } from './expressions/super-expression';
import { createThisExpression } from './expressions/this-expression';
import { createWhenExpression } from './expressions/when';
import { createAssignment } from './statements/assignment';
import { createBlock } from './statements/block';
import { createBreakStatement } from './statements/break';
import { createContinueStatement } from './statements/continue';
import { createExpressionStatement } from './statements/expression';
import { createForStatement } from './statements/for';
import { createIfStatement } from './statements/if';
import { createReturnStatement } from './statements/return';
import { createThrowStatement } from './statements/throw';
import { createTryExpression } from './statements/try';
import { createWhenStatement } from './statements/when';
import { createWhileStatement } from './statements/while';
import { createImportDirective } from './structure/import-directive';
import { createPackageHeader } from './structure/package-header';
import { createSourceFile } from './structure/source-file';
import { createFunctionType } from './types/function-type';
import { createNullableType } from './types/nullable-type';
import { createStarProjection } from './types/star-projection';
import { createTypeParameter } from './types/type-parameter';
import { createTypeProjection } from './types/type-projection';
import { createUserType } from './types/user-type';

export const factory = {
  createAnnotation,
  createAsExpression,
  createAssignment,
  createBinaryExpression,
  createBlock,
  createBreakStatement,
  createCallExpression,
  createCallableReference,
  createClassDeclaration,
  createContinueStatement,
  createElvisExpression,
  createEnumEntry,
  createExpressionStatement,
  createForStatement,
  createFunctionDeclaration,
  createFunctionType,
  createIdentifier,
  createIfExpression,
  createIfStatement,
  createImportDirective,
  createIndexingExpression,
  createInitBlock,
  createIsExpression,
  createLambdaExpression,
  createLiteral,
  createNavigationExpression,
  createNullableType,
  createObjectDeclaration,
  createPackageHeader,
  createParameter,
  createParenthesizedExpression,
  createPostfixUnaryExpression,
  createPrefixUnaryExpression,
  createPrimaryConstructor,
  createProperty,
  createReturnStatement,
  createSourceFile,
  createStarProjection,
  createStringLiteral,
  createSuperExpression,
  createThisExpression,
  createThrowStatement,
  createTryExpression,
  createTypeAlias,
  createTypeParameter,
  createTypeProjection,
  createUserType,
  createWhenExpression,
  createWhenStatement,
  createWhileStatement,
} as const;
