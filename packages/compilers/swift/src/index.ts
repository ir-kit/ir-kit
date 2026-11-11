import type { SwiftNode as _SwiftNode, SwiftNodeBase as _SwiftNodeBase } from './nodes/base';
import { factory } from './nodes/factory';
import { SwiftNodeKind } from './nodes/kinds';
import type { SwiftStatement as _SwiftStatement } from './nodes/statement';
import type { SwiftSourceFile as _SwiftSourceFile } from './nodes/structure/source-file';
import type { SwiftPrinterOptions as _SwiftPrinterOptions } from './printer';
import { createPrinter, printAst } from './printer';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace swift {
  // Base / Core
  export type Node = _SwiftNode;
  export type NodeBase = _SwiftNodeBase;
  export type NodeKind = SwiftNodeKind;
  export type Statement = _SwiftStatement;

  // Structure
  export type SourceFile = _SwiftSourceFile;

  // Declarations

  // Statements

  // Expressions

  // Printer
  export type PrinterOptions = _SwiftPrinterOptions;

  // Miscellaneous
}

export const swift = {
  SwiftNodeKind,
  createPrinter,
  factory,
  printAst,
} as const;
