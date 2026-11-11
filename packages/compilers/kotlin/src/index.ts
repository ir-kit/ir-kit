import type {
  KotlinNode as _KotlinNode,
  KotlinNodeBase as _KotlinNodeBase,
} from "./nodes/base.js";
import { factory } from "./nodes/factory.js";
import { KotlinNodeKind } from "./nodes/kinds.js";
import type { KotlinStatement as _KotlinStatement } from "./nodes/statement.js";
import type { KotlinSourceFile as _KotlinSourceFile } from "./nodes/structure/source-file.js";
import type { KotlinPrinterOptions as _KotlinPrinterOptions } from "./printer.js";
import { createPrinter, printAst } from "./printer.js";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace kt {
  // Base / Core
  export type Node = _KotlinNode;
  export type NodeBase = _KotlinNodeBase;
  export type NodeKind = KotlinNodeKind;
  export type Statement = _KotlinStatement;

  // Structure
  export type SourceFile = _KotlinSourceFile;

  // Declarations

  // Statements

  // Expressions

  // Printer
  export type PrinterOptions = _KotlinPrinterOptions;

  // Miscellaneous
}

export const kt = {
  KotlinNodeKind,
  createPrinter,
  factory,
  printAst,
} as const;
