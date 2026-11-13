import { createAccessorBlock } from "./declarations/accessor-block.js";
import { createActorDeclaration } from "./declarations/actor.js";
import { createAssociatedTypeDeclaration } from "./declarations/associatedtype.js";
import { createClassDeclaration } from "./declarations/class.js";
import { createDeinitializerDeclaration } from "./declarations/deinitializer.js";
import { createEnumDeclaration } from "./declarations/enum.js";
import { createEnumCaseDeclaration } from "./declarations/enum-case.js";
import { createExtensionDeclaration } from "./declarations/extension.js";
import { createFunctionDeclaration } from "./declarations/function.js";
import { createInitializerDeclaration } from "./declarations/initializer.js";
import { createMacroDeclaration } from "./declarations/macro-declaration.js";
import { createProtocolDeclaration } from "./declarations/protocol.js";
import { createStructDeclaration } from "./declarations/struct.js";
import { createSubscriptDeclaration } from "./declarations/subscript-declaration.js";
import { createTypeAliasDeclaration } from "./declarations/typealias.js";
import { createVariableDeclaration } from "./declarations/variable.js";
import { createArrayLiteral } from "./expressions/array-literal.js";
import { createAsExpression } from "./expressions/as-expression.js";
import { createAssignmentExpression } from "./expressions/assignment-expression.js";
import { createAwaitExpression } from "./expressions/await-expression.js";
import { createBooleanLiteral } from "./expressions/boolean-literal.js";
import { createClosureExpression } from "./expressions/closure-expression.js";
import { createDictionaryLiteral } from "./expressions/dictionary-literal.js";
import { createFloatLiteral } from "./expressions/float-literal.js";
import { createFunctionCallExpression } from "./expressions/function-call-expression.js";
import { createIdentifier } from "./expressions/identifier.js";
import { createImplicitMemberExpression } from "./expressions/implicit-member-expression.js";
import { createInfixOperatorExpression } from "./expressions/infix-operator-expression.js";
import { createIntegerLiteral } from "./expressions/integer-literal.js";
import { createInterpolatedStringLiteral } from "./expressions/interpolated-string-literal.js";
import { createIsExpression } from "./expressions/is-expression.js";
import { createKeyPathExpression } from "./expressions/key-path-expression.js";
import { createMacroExpansionExpression } from "./expressions/macro-expansion-expression.js";
import { createMemberAccessExpression } from "./expressions/member-access-expression.js";
import { createMultilineStringLiteral } from "./expressions/multiline-string-literal.js";
import { createNilLiteral } from "./expressions/nil-literal.js";
import { createPostfixOperatorExpression } from "./expressions/postfix-operator-expression.js";
import { createPrefixOperatorExpression } from "./expressions/prefix-operator-expression.js";
import { createRangeExpression } from "./expressions/range-expression.js";
import { createRegexLiteral } from "./expressions/regex-literal.js";
import { createSelectorExpression } from "./expressions/selector-expression.js";
import { createSelfExpression } from "./expressions/self-expression.js";
import { createStringLiteral } from "./expressions/string-literal.js";
import { createSubscriptExpression } from "./expressions/subscript-expression.js";
import { createSuperExpression } from "./expressions/super-expression.js";
import { createTernaryExpression } from "./expressions/ternary-expression.js";
import { createTryExpression } from "./expressions/try-expression.js";
import { createTupleExpression } from "./expressions/tuple-expression.js";
import { createTypeExpression } from "./expressions/type-expression.js";
import { createEnumCasePattern } from "./patterns/enum-case-pattern.js";
import { createExpressionPattern } from "./patterns/expression-pattern.js";
import { createIdentifierPattern } from "./patterns/identifier-pattern.js";
import { createIsPattern } from "./patterns/is-pattern.js";
import { createOptionalPattern } from "./patterns/optional-pattern.js";
import { createTuplePattern } from "./patterns/tuple-pattern.js";
import { createValueBindingPattern } from "./patterns/value-binding-pattern.js";
import { createWildcardPattern } from "./patterns/wildcard-pattern.js";
import { createBreakStatement } from "./statements/break.js";
import { createConditionalCompilation } from "./statements/conditional-compilation.js";
import { createContinueStatement } from "./statements/continue.js";
import { createDeferStatement } from "./statements/defer.js";
import { createDiscardStatement } from "./statements/discard-statement.js";
import { createCatchClause, createDoStatement } from "./statements/do.js";
import { createExpressionStatement } from "./statements/expression.js";
import { createFallthroughStatement } from "./statements/fallthrough.js";
import { createForInStatement } from "./statements/for-in.js";
import { createGuardStatement } from "./statements/guard.js";
import { createIfStatement } from "./statements/if.js";
import { createImportDeclaration } from "./statements/import-declaration.js";
import { createLabeledStatement } from "./statements/labeled-statement.js";
import { createOperatorDeclaration } from "./statements/operator-declaration.js";
import { createPrecedenceGroupDeclaration } from "./statements/precedence-group-declaration.js";
import { createRepeatWhileStatement } from "./statements/repeat-while.js";
import { createReturnStatement } from "./statements/return.js";
import {
  createSwitchCase,
  createSwitchStatement,
} from "./statements/switch.js";
import { createThrowStatement } from "./statements/throw.js";
import { createWhileStatement } from "./statements/while.js";
import { createSourceFile } from "./structure/source-file.js";
import { createArrayType } from "./types/array-type.js";
import { createCompositionType } from "./types/composition-type.js";
import { createDictionaryType } from "./types/dictionary-type.js";
import { createFunctionType } from "./types/function-type.js";
import { createIdentifierType } from "./types/identifier-type.js";
import { createImplicitlyUnwrappedOptionalType } from "./types/implicitly-unwrapped-optional-type.js";
import { createMemberType } from "./types/member-type.js";
import { createMetatypeType } from "./types/metatype-type.js";
import { createOptionalType } from "./types/optional-type.js";
import { createPackElementType } from "./types/pack-element-type.js";
import { createPackExpansionType } from "./types/pack-expansion-type.js";
import { createSomeOrAnyType } from "./types/some-or-any-type.js";
import { createTupleType } from "./types/tuple-type.js";

export const factory = {
  createAccessorBlock,
  createActorDeclaration,
  createArrayLiteral,
  createArrayType,
  createAsExpression,
  createAssignmentExpression,
  createAssociatedTypeDeclaration,
  createAwaitExpression,
  createBooleanLiteral,
  createBreakStatement,
  createCatchClause,
  createClassDeclaration,
  createClosureExpression,
  createCompositionType,
  createConditionalCompilation,
  createContinueStatement,
  createDeferStatement,
  createDeinitializerDeclaration,
  createDictionaryLiteral,
  createDictionaryType,
  createDiscardStatement,
  createDoStatement,
  createEnumCaseDeclaration,
  createEnumCasePattern,
  createEnumDeclaration,
  createExpressionPattern,
  createExpressionStatement,
  createExtensionDeclaration,
  createFallthroughStatement,
  createFloatLiteral,
  createForInStatement,
  createFunctionCallExpression,
  createFunctionDeclaration,
  createFunctionType,
  createGuardStatement,
  createIdentifier,
  createIdentifierPattern,
  createIdentifierType,
  createIfStatement,
  createImplicitlyUnwrappedOptionalType,
  createImportDeclaration,
  createInfixOperatorExpression,
  createInitializerDeclaration,
  createIntegerLiteral,
  createInterpolatedStringLiteral,
  createIsExpression,
  createIsPattern,
  createKeyPathExpression,
  createLabeledStatement,
  createMacroDeclaration,
  createMacroExpansionExpression,
  createMemberAccessExpression,
  createMemberType,
  createMetatypeType,
  createMultilineStringLiteral,
  createNilLiteral,
  createOperatorDeclaration,
  createOptionalPattern,
  createOptionalType,
  createPackElementType,
  createPackExpansionType,
  createPostfixOperatorExpression,
  createPrecedenceGroupDeclaration,
  createPrefixOperatorExpression,
  createProtocolDeclaration,
  createRangeExpression,
  createRegexLiteral,
  createRepeatWhileStatement,
  createReturnStatement,
  createSelectorExpression,
  createImplicitMemberExpression,
  createSelfExpression,
  createTypeExpression,
  createSomeOrAnyType,
  createSourceFile,
  createStringLiteral,
  createStructDeclaration,
  createSubscriptDeclaration,
  createSubscriptExpression,
  createSuperExpression,
  createSwitchCase,
  createSwitchStatement,
  createTernaryExpression,
  createThrowStatement,
  createTryExpression,
  createTupleExpression,
  createTuplePattern,
  createTupleType,
  createTypeAliasDeclaration,
  createValueBindingPattern,
  createVariableDeclaration,
  createWhileStatement,
  createWildcardPattern,
} as const;
