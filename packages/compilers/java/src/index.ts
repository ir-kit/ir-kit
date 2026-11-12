import { factory } from "./nodes/factory.js";
import { JavaNodeKind } from "./nodes/kinds.js";
import { createPrinter, printAst } from "./printer.js";

export const java = {
  JavaNodeKind,
  createPrinter,
  factory,
  printAst,
} as const;
