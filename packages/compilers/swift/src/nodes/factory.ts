import { createAccessorBlock } from './declarations/accessor-block';
import { createActorDeclaration } from './declarations/actor';
import { createAssociatedTypeDeclaration } from './declarations/associatedtype';
import { createClassDeclaration } from './declarations/class';
import { createDeinitializerDeclaration } from './declarations/deinitializer';
import { createEnumDeclaration } from './declarations/enum';
import { createEnumCaseDeclaration } from './declarations/enum-case';
import { createExtensionDeclaration } from './declarations/extension';
import { createFunctionDeclaration } from './declarations/function';
import { createInitializerDeclaration } from './declarations/initializer';
import { createMacroDeclaration } from './declarations/macro-declaration';
import { createProtocolDeclaration } from './declarations/protocol';
import { createStructDeclaration } from './declarations/struct';
import { createSubscriptDeclaration } from './declarations/subscript-declaration';
import { createTypeAliasDeclaration } from './declarations/typealias';
import { createVariableDeclaration } from './declarations/variable';
import { createArrayLiteral } from './expressions/array-literal';
import { createAsExpression } from './expressions/as-expression';
import { createAssignmentExpression } from './expressions/assignment-expression';
import { createAwaitExpression } from './expressions/await-expression';
import { createBooleanLiteral } from './expressions/boolean-literal';
import { createClosureExpression } from './expressions/closure-expression';
import { createDictionaryLiteral } from './expressions/dictionary-literal';
import { createFloatLiteral } from './expressions/float-literal';
import { createFunctionCallExpression } from './expressions/function-call-expression';
import { createIdentifier } from './expressions/identifier';
import { createInfixOperatorExpression } from './expressions/infix-operator-expression';
import { createIntegerLiteral } from './expressions/integer-literal';
import { createInterpolatedStringLiteral } from './expressions/interpolated-string-literal';
import { createIsExpression } from './expressions/is-expression';
import { createKeyPathExpression } from './expressions/key-path-expression';
import { createMacroExpansionExpression } from './expressions/macro-expansion-expression';
import { createMemberAccessExpression } from './expressions/member-access-expression';
import { createMultilineStringLiteral } from './expressions/multiline-string-literal';
import { createNilLiteral } from './expressions/nil-literal';
import { createPostfixOperatorExpression } from './expressions/postfix-operator-expression';
import { createPrefixOperatorExpression } from './expressions/prefix-operator-expression';
import { createRangeExpression } from './expressions/range-expression';
import { createRegexLiteral } from './expressions/regex-literal';
import { createSelectorExpression } from './expressions/selector-expression';
import { createSelfExpression } from './expressions/self-expression';
import { createStringLiteral } from './expressions/string-literal';
import { createSubscriptExpression } from './expressions/subscript-expression';
import { createSuperExpression } from './expressions/super-expression';
import { createTernaryExpression } from './expressions/ternary-expression';
import { createTryExpression } from './expressions/try-expression';
import { createTupleExpression } from './expressions/tuple-expression';
import { createEnumCasePattern } from './patterns/enum-case-pattern';
import { createExpressionPattern } from './patterns/expression-pattern';
import { createIdentifierPattern } from './patterns/identifier-pattern';
import { createIsPattern } from './patterns/is-pattern';
import { createOptionalPattern } from './patterns/optional-pattern';
import { createTuplePattern } from './patterns/tuple-pattern';
import { createValueBindingPattern } from './patterns/value-binding-pattern';
import { createWildcardPattern } from './patterns/wildcard-pattern';
import { createBreakStatement } from './statements/break';
import { createConditionalCompilation } from './statements/conditional-compilation';
import { createContinueStatement } from './statements/continue';
import { createDeferStatement } from './statements/defer';
import { createDiscardStatement } from './statements/discard-statement';
import { createCatchClause } from './statements/do';
import { createDoStatement } from './statements/do';
import { createExpressionStatement } from './statements/expression';
import { createFallthroughStatement } from './statements/fallthrough';
import { createForInStatement } from './statements/for-in';
import { createGuardStatement } from './statements/guard';
import { createIfStatement } from './statements/if';
import { createImportDeclaration } from './statements/import-declaration';
import { createLabeledStatement } from './statements/labeled-statement';
import { createOperatorDeclaration } from './statements/operator-declaration';
import { createPrecedenceGroupDeclaration } from './statements/precedence-group-declaration';
import { createRepeatWhileStatement } from './statements/repeat-while';
import { createReturnStatement } from './statements/return';
import { createSwitchCase } from './statements/switch';
import { createSwitchStatement } from './statements/switch';
import { createThrowStatement } from './statements/throw';
import { createWhileStatement } from './statements/while';
import { createSourceFile } from './structure/source-file';
import { createArrayType } from './types/array-type';
import { createCompositionType } from './types/composition-type';
import { createDictionaryType } from './types/dictionary-type';
import { createFunctionType } from './types/function-type';
import { createIdentifierType } from './types/identifier-type';
import { createImplicitlyUnwrappedOptionalType } from './types/implicitly-unwrapped-optional-type';
import { createMemberType } from './types/member-type';
import { createMetatypeType } from './types/metatype-type';
import { createOptionalType } from './types/optional-type';
import { createPackElementType } from './types/pack-element-type';
import { createPackExpansionType } from './types/pack-expansion-type';
import { createSomeOrAnyType } from './types/some-or-any-type';
import { createTupleType } from './types/tuple-type';

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
  createSelfExpression,
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
