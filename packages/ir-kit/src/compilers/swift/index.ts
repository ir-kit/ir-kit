import type {
  SwiftNode as _SwiftNode,
  SwiftNodeBase as _SwiftNodeBase,
} from "./nodes/base.js";
import type { SwiftEnumCaseDeclaration as _SwiftEnumCaseDeclaration } from "./nodes/declarations/enum-case.js";
import type {
  SwiftFunctionDeclaration as _SwiftFunctionDeclaration,
  SwiftFunctionParameter as _SwiftFunctionParameter,
} from "./nodes/declarations/function.js";
import type { SwiftInitializerDeclaration as _SwiftInitializerDeclaration } from "./nodes/declarations/initializer.js";
import type { SwiftVariableDeclaration as _SwiftVariableDeclaration } from "./nodes/declarations/variable.js";
import type { SwiftExpression as _SwiftExpression } from "./nodes/expression.js";
import type { SwiftClosureExpression as _SwiftClosureExpression } from "./nodes/expressions/closure-expression.js";
import type { SwiftCallArgument as _SwiftCallArgument } from "./nodes/expressions/function-call-expression.js";
import { factory } from "./nodes/factory.js";
import { SwiftNodeKind } from "./nodes/kinds.js";
import type { SwiftPattern as _SwiftPattern } from "./nodes/pattern.js";
import type { SwiftStatement as _SwiftStatement } from "./nodes/statement.js";
import type { SwiftSwitchCase as _SwiftSwitchCase } from "./nodes/statements/switch.js";
import type { SwiftSourceFile as _SwiftSourceFile } from "./nodes/structure/source-file.js";
import type { SwiftType as _SwiftType } from "./nodes/type.js";
import type { SwiftPrinterOptions as _SwiftPrinterOptions } from "./printer.js";
import { createPrinter, printAst } from "./printer.js";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace swift {
  // Base / Core
  export type Node = _SwiftNode;
  export type NodeBase = _SwiftNodeBase;
  export type NodeKind = SwiftNodeKind;
  export type Statement = _SwiftStatement;
  export type Expression = _SwiftExpression;
  export type Type = _SwiftType;
  export type Pattern = _SwiftPattern;
  export type CallArgument = _SwiftCallArgument;
  export type ClosureExpression = _SwiftClosureExpression;
  export type EnumCaseDeclaration = _SwiftEnumCaseDeclaration;
  export type FunctionDeclaration = _SwiftFunctionDeclaration;
  export type FunctionParameter = _SwiftFunctionParameter;
  export type InitializerDeclaration = _SwiftInitializerDeclaration;
  export type SwitchCase = _SwiftSwitchCase;
  export type VariableDeclaration = _SwiftVariableDeclaration;

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
