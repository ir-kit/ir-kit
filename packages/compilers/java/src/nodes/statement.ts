import type { JavaClassDeclaration } from './declarations/class';
import type { JavaEnumDeclaration } from './declarations/enum';
import type { JavaInterfaceDeclaration } from './declarations/interface';
import type { JavaMethodDeclaration } from './declarations/method';
import type { JavaVariableDeclaration } from './declarations/variable';
import type { JavaAssertStatement } from './statements/assert';
import type { JavaAssignment, JavaAugmentedAssignment } from './statements/assignment';
import type { JavaBreakStatement } from './statements/break';
import type { JavaContinueStatement } from './statements/continue';
import type { JavaDoWhileStatement } from './statements/dowhile';
import type { JavaEmptyStatement } from './statements/empty';
import type { JavaExpressionStatement } from './statements/expression';
import type { JavaForStatement } from './statements/for';
import type { JavaIfStatement } from './statements/if';
import type { JavaImportStatement } from './statements/import';
import type { JavaLabeledStatement } from './statements/labeled';
import type { JavaReturnStatement } from './statements/return';
import type { JavaSwitchStatement } from './statements/switch';
import type { JavaSynchronizedStatement } from './statements/synchronized';
import type { JavaThrowStatement } from './statements/throw';
import type { JavaTryStatement } from './statements/try';
import type { JavaWhileStatement } from './statements/while';
import type { JavaYieldStatement } from './statements/yield';
import type { JavaComment } from './structure/comment';

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
