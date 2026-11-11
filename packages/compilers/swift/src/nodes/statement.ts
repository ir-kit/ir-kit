import type { SwiftAccessorBlock } from "./declarations/accessor-block.js";
import type { SwiftActorDeclaration } from "./declarations/actor.js";
import type { SwiftAssociatedTypeDeclaration } from "./declarations/associatedtype.js";
import type { SwiftClassDeclaration } from "./declarations/class.js";
import type { SwiftDeinitializerDeclaration } from "./declarations/deinitializer.js";
import type { SwiftEnumDeclaration } from "./declarations/enum.js";
import type { SwiftEnumCaseDeclaration } from "./declarations/enum-case.js";
import type { SwiftExtensionDeclaration } from "./declarations/extension.js";
import type { SwiftFunctionDeclaration } from "./declarations/function.js";
import type { SwiftInitializerDeclaration } from "./declarations/initializer.js";
import type { SwiftMacroDeclaration } from "./declarations/macro-declaration.js";
import type { SwiftProtocolDeclaration } from "./declarations/protocol.js";
import type { SwiftStructDeclaration } from "./declarations/struct.js";
import type { SwiftSubscriptDeclaration } from "./declarations/subscript-declaration.js";
import type { SwiftTypeAliasDeclaration } from "./declarations/typealias.js";
import type { SwiftVariableDeclaration } from "./declarations/variable.js";
import type { SwiftBreakStatement } from "./statements/break.js";
import type { SwiftConditionalCompilation } from "./statements/conditional-compilation.js";
import type { SwiftContinueStatement } from "./statements/continue.js";
import type { SwiftDeferStatement } from "./statements/defer.js";
import type { SwiftDiscardStatement } from "./statements/discard-statement.js";
import type { SwiftDoStatement } from "./statements/do.js";
import type { SwiftExpressionStatement } from "./statements/expression.js";
import type { SwiftFallthroughStatement } from "./statements/fallthrough.js";
import type { SwiftForInStatement } from "./statements/for-in.js";
import type { SwiftGuardStatement } from "./statements/guard.js";
import type { SwiftIfStatement } from "./statements/if.js";
import type { SwiftImportDeclaration } from "./statements/import-declaration.js";
import type { SwiftLabeledStatement } from "./statements/labeled-statement.js";
import type { SwiftOperatorDeclaration } from "./statements/operator-declaration.js";
import type { SwiftPrecedenceGroupDeclaration } from "./statements/precedence-group-declaration.js";
import type { SwiftRepeatWhileStatement } from "./statements/repeat-while.js";
import type { SwiftReturnStatement } from "./statements/return.js";
import type { SwiftSwitchStatement } from "./statements/switch.js";
import type { SwiftThrowStatement } from "./statements/throw.js";
import type { SwiftWhileStatement } from "./statements/while.js";

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
