import type { KotlinProperty } from "./declarations/property.js";
import type { KotlinAssignment } from "./statements/assignment.js";
import type { KotlinBlock } from "./statements/block.js";
import type { KotlinBreakStatement } from "./statements/break.js";
import type { KotlinContinueStatement } from "./statements/continue.js";
import type { KotlinExpressionStatement } from "./statements/expression.js";
import type { KotlinForStatement } from "./statements/for.js";
import type { KotlinIfStatement } from "./statements/if.js";
import type { KotlinReturnStatement } from "./statements/return.js";
import type { KotlinThrowStatement } from "./statements/throw.js";
import type { KotlinTryExpression } from "./statements/try.js";
import type { KotlinWhenStatement } from "./statements/when.js";
import type { KotlinWhileStatement } from "./statements/while.js";

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
