import type { GoNode as _GoNode, GoNodeBase as _GoNodeBase } from './nodes/base';
import type { GoExpression as _GoExpression } from './nodes/expression';
import { factory } from './nodes/factory';
import { GoNodeKind } from './nodes/kinds';
import type { GoStatement as _GoStatement } from './nodes/statement';
import type { GoComment as _GoComment } from './nodes/structure/comment';
import type { GoSourceFile as _GoSourceFile } from './nodes/structure/source-file';
import type { GoPrinterOptions as _GoPrinterOptions } from './printer';
import { createPrinter, printAst } from './printer';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace go {
  // Base / Core
  export type Node = _GoNode;
  export type NodeBase = _GoNodeBase;
  export type NodeKind = GoNodeKind;
  export type Expression = _GoExpression;
  export type Statement = _GoStatement;

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
  createPrinter,
  factory,
  printAst,
} as const;
