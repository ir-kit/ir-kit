import { factory } from './nodes/factory';
import { JavaNodeKind } from './nodes/kinds';
import { createPrinter, printAst } from './printer';

export const java = {
  JavaNodeKind,
  createPrinter,
  factory,
  printAst,
} as const;
