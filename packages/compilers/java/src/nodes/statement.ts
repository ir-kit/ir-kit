import type { JavaClassDeclaration } from "./declarations/class.js";
import type { JavaEnumDeclaration } from "./declarations/enum.js";
import type { JavaInterfaceDeclaration } from "./declarations/interface.js";
import type { JavaMethodDeclaration } from "./declarations/method.js";
import type { JavaVariableDeclaration } from "./declarations/variable.js";
import type { JavaAssertStatement } from "./statements/assert.js";
import type {
  JavaAssignment,
  JavaAugmentedAssignment,
} from "./statements/assignment.js";
import type { JavaBreakStatement } from "./statements/break.js";
import type { JavaContinueStatement } from "./statements/continue.js";
import type { JavaDoWhileStatement } from "./statements/dowhile.js";
import type { JavaEmptyStatement } from "./statements/empty.js";
import type { JavaExpressionStatement } from "./statements/expression.js";
import type { JavaForStatement } from "./statements/for.js";
import type { JavaIfStatement } from "./statements/if.js";
import type { JavaImportStatement } from "./statements/import.js";
import type { JavaLabeledStatement } from "./statements/labeled.js";
import type { JavaReturnStatement } from "./statements/return.js";
import type { JavaSwitchStatement } from "./statements/switch.js";
import type { JavaSynchronizedStatement } from "./statements/synchronized.js";
import type { JavaThrowStatement } from "./statements/throw.js";
import type { JavaTryStatement } from "./statements/try.js";
import type { JavaWhileStatement } from "./statements/while.js";
import type { JavaYieldStatement } from "./statements/yield.js";
import type { JavaComment } from "./structure/comment.js";

export type JavaStatement =
  | JavaClassDeclaration
  | JavaInterfaceDeclaration
  | JavaEnumDeclaration
  | JavaAssignment
  | JavaAugmentedAssignment
  | JavaBreakStatement
  | JavaContinueStatement
  | JavaAssertStatement
  | JavaEmptyStatement
  | JavaExpressionStatement
  | JavaLabeledStatement
  | JavaForStatement
  | JavaIfStatement
  | JavaMethodDeclaration
  | JavaImportStatement
  | JavaSwitchStatement
  | JavaThrowStatement
  | JavaTryStatement
  | JavaDoWhileStatement
  | JavaSynchronizedStatement
  | JavaYieldStatement
  | JavaWhileStatement
  | JavaVariableDeclaration
  | JavaReturnStatement
  | JavaComment;
