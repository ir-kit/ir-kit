import type { KotlinProperty } from './declarations/property';
import type { KotlinAssignment } from './statements/assignment';
import type { KotlinBlock } from './statements/block';
import type { KotlinBreakStatement } from './statements/break';
import type { KotlinContinueStatement } from './statements/continue';
import type { KotlinExpressionStatement } from './statements/expression';
import type { KotlinForStatement } from './statements/for';
import type { KotlinIfStatement } from './statements/if';
import type { KotlinReturnStatement } from './statements/return';
import type { KotlinThrowStatement } from './statements/throw';
import type { KotlinTryExpression } from './statements/try';
import type { KotlinWhenStatement } from './statements/when';
import type { KotlinWhileStatement } from './statements/while';

export type KotlinStatement =
  | KotlinAssignment
  | KotlinBlock
  | KotlinBreakStatement
  | KotlinContinueStatement
  | KotlinExpressionStatement
  | KotlinForStatement
  | KotlinIfStatement
  | KotlinProperty
  | KotlinReturnStatement
  | KotlinThrowStatement
  | KotlinTryExpression
  | KotlinWhenStatement
  | KotlinWhileStatement;
