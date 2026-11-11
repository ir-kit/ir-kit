import { createAnnotation } from "./declarations/annotation.js";
import { createClassDeclaration } from "./declarations/class.js";
import { createEnumEntry } from "./declarations/enum-entry.js";
import { createFunctionDeclaration } from "./declarations/function.js";
import { createInitBlock } from "./declarations/init-block.js";
import { createObjectDeclaration } from "./declarations/object.js";
import { createParameter } from "./declarations/parameter.js";
import { createPrimaryConstructor } from "./declarations/primary-constructor.js";
import { createProperty } from "./declarations/property.js";
import { createTypeAlias } from "./declarations/type-alias.js";
import { createAsExpression } from "./expressions/as-expression.js";
import { createBinaryExpression } from "./expressions/binary.js";
import { createCallExpression } from "./expressions/call.js";
import { createCallableReference } from "./expressions/callable-reference.js";
import { createElvisExpression } from "./expressions/elvis.js";
import { createIdentifier } from "./expressions/identifier.js";
import { createIfExpression } from "./expressions/if.js";
import { createIndexingExpression } from "./expressions/indexing-expression.js";
import { createIsExpression } from "./expressions/is-expression.js";
import { createLambdaExpression } from "./expressions/lambda.js";
import { createLiteral } from "./expressions/literal.js";
import { createNavigationExpression } from "./expressions/navigation.js";
import { createParenthesizedExpression } from "./expressions/parenthesized.js";
import { createPostfixUnaryExpression } from "./expressions/postfix-unary.js";
import { createPrefixUnaryExpression } from "./expressions/prefix-unary.js";
import { createStringLiteral } from "./expressions/string-literal.js";
import { createSuperExpression } from "./expressions/super-expression.js";
import { createThisExpression } from "./expressions/this-expression.js";
import { createWhenExpression } from "./expressions/when.js";
import { createAssignment } from "./statements/assignment.js";
import { createBlock } from "./statements/block.js";
import { createBreakStatement } from "./statements/break.js";
import { createContinueStatement } from "./statements/continue.js";
import { createExpressionStatement } from "./statements/expression.js";
import { createForStatement } from "./statements/for.js";
import { createIfStatement } from "./statements/if.js";
import { createReturnStatement } from "./statements/return.js";
import { createThrowStatement } from "./statements/throw.js";
import { createTryExpression } from "./statements/try.js";
import { createWhenStatement } from "./statements/when.js";
import { createWhileStatement } from "./statements/while.js";
import { createImportDirective } from "./structure/import-directive.js";
import { createPackageHeader } from "./structure/package-header.js";
import { createSourceFile } from "./structure/source-file.js";
import { createFunctionType } from "./types/function-type.js";
import { createNullableType } from "./types/nullable-type.js";
import { createStarProjection } from "./types/star-projection.js";
import { createTypeParameter } from "./types/type-parameter.js";
import { createTypeProjection } from "./types/type-projection.js";
import { createUserType } from "./types/user-type.js";

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
