import type {
  GoNode as _GoNode,
  GoNodeBase as _GoNodeBase,
} from "./nodes/base.js";
import type { GoExpression as _GoExpression } from "./nodes/expression.js";
import { factory } from "./nodes/factory.js";
import { GoNodeKind } from "./nodes/kinds.js";
import { GoNodeFlags } from "./nodes/node-flags.js";
import type { GoStatement as _GoStatement } from "./nodes/statement.js";
import type { GoComment as _GoComment } from "./nodes/structure/comment.js";
import type { GoSourceFile as _GoSourceFile } from "./nodes/structure/source-file.js";
import type { GoType as _GoType } from "./nodes/type.js";
import type { GoPrinterOptions as _GoPrinterOptions } from "./printer.js";
import { createPrinter, printAst } from "./printer.js";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace go {
  // Base / Core
  export type Node = _GoNode;
  export type NodeBase = _GoNodeBase;
  export type NodeKind = GoNodeKind;
  export type Expression = _GoExpression;
  export type Statement = _GoStatement;
  export type Type = _GoType;

  // Structure
  export type SourceFile = _GoSourceFile;
  export type Comment = _GoComment;

  // Declarations

  // Statements

  // Expressions

  // Printer
  export type PrinterOptions = _GoPrinterOptions;

  // Miscellaneous
}

export const go = {
  GoNodeKind,
  NodeFlags: GoNodeFlags,
  createPrinter,
  factory,
  printAst,
} as const;
