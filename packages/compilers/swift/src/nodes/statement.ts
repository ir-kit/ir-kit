import type { SwiftAccessorBlock } from './declarations/accessor-block';
import type { SwiftActorDeclaration } from './declarations/actor';
import type { SwiftAssociatedTypeDeclaration } from './declarations/associatedtype';
import type { SwiftClassDeclaration } from './declarations/class';
import type { SwiftDeinitializerDeclaration } from './declarations/deinitializer';
import type { SwiftEnumDeclaration } from './declarations/enum';
import type { SwiftEnumCaseDeclaration } from './declarations/enum-case';
import type { SwiftExtensionDeclaration } from './declarations/extension';
import type { SwiftFunctionDeclaration } from './declarations/function';
import type { SwiftInitializerDeclaration } from './declarations/initializer';
import type { SwiftMacroDeclaration } from './declarations/macro-declaration';
import type { SwiftProtocolDeclaration } from './declarations/protocol';
import type { SwiftStructDeclaration } from './declarations/struct';
import type { SwiftSubscriptDeclaration } from './declarations/subscript-declaration';
import type { SwiftTypeAliasDeclaration } from './declarations/typealias';
import type { SwiftVariableDeclaration } from './declarations/variable';
import type { SwiftBreakStatement } from './statements/break';
import type { SwiftConditionalCompilation } from './statements/conditional-compilation';
import type { SwiftContinueStatement } from './statements/continue';
import type { SwiftDeferStatement } from './statements/defer';
import type { SwiftDiscardStatement } from './statements/discard-statement';
import type { SwiftDoStatement } from './statements/do';
import type { SwiftExpressionStatement } from './statements/expression';
import type { SwiftFallthroughStatement } from './statements/fallthrough';
import type { SwiftForInStatement } from './statements/for-in';
import type { SwiftGuardStatement } from './statements/guard';
import type { SwiftIfStatement } from './statements/if';
import type { SwiftImportDeclaration } from './statements/import-declaration';
import type { SwiftLabeledStatement } from './statements/labeled-statement';
import type { SwiftOperatorDeclaration } from './statements/operator-declaration';
import type { SwiftPrecedenceGroupDeclaration } from './statements/precedence-group-declaration';
import type { SwiftRepeatWhileStatement } from './statements/repeat-while';
import type { SwiftReturnStatement } from './statements/return';
import type { SwiftSwitchStatement } from './statements/switch';
import type { SwiftThrowStatement } from './statements/throw';
import type { SwiftWhileStatement } from './statements/while';

export type SwiftStatement =
  | SwiftAccessorBlock
  | SwiftActorDeclaration
  | SwiftAssociatedTypeDeclaration
  | SwiftBreakStatement
  | SwiftClassDeclaration
  | SwiftConditionalCompilation
  | SwiftContinueStatement
  | SwiftDeferStatement
  | SwiftDeinitializerDeclaration
  | SwiftDiscardStatement
  | SwiftDoStatement
  | SwiftEnumCaseDeclaration
  | SwiftEnumDeclaration
  | SwiftExpressionStatement
  | SwiftExtensionDeclaration
  | SwiftFallthroughStatement
  | SwiftForInStatement
  | SwiftFunctionDeclaration
  | SwiftGuardStatement
  | SwiftIfStatement
  | SwiftImportDeclaration
  | SwiftInitializerDeclaration
  | SwiftLabeledStatement
  | SwiftMacroDeclaration
  | SwiftOperatorDeclaration
  | SwiftPrecedenceGroupDeclaration
  | SwiftProtocolDeclaration
  | SwiftRepeatWhileStatement
  | SwiftReturnStatement
  | SwiftStructDeclaration
  | SwiftSubscriptDeclaration
  | SwiftSwitchStatement
  | SwiftThrowStatement
  | SwiftTypeAliasDeclaration
  | SwiftVariableDeclaration
  | SwiftWhileStatement;
