import type {
  KotlinNode as _KotlinNode,
  KotlinNodeBase as _KotlinNodeBase,
} from "./nodes/base.js";
import type { KotlinDeclaration as _KotlinDeclaration } from "./nodes/declaration.js";
import type { KotlinAnnotation as _KotlinAnnotation } from "./nodes/declarations/annotation.js";
import type { KotlinClassDeclaration as _KotlinClassDeclaration } from "./nodes/declarations/class.js";
import type { KotlinEnumEntry as _KotlinEnumEntry } from "./nodes/declarations/enum-entry.js";
import type { KotlinFunctionDeclaration as _KotlinFunctionDeclaration } from "./nodes/declarations/function.js";
import type { KotlinObjectDeclaration as _KotlinObjectDeclaration } from "./nodes/declarations/object.js";
import type { KotlinParameter as _KotlinParameter } from "./nodes/declarations/parameter.js";
import type { KotlinProperty as _KotlinProperty } from "./nodes/declarations/property.js";
import type { KotlinExpression as _KotlinExpression } from "./nodes/expression.js";
import type { KotlinLambdaExpression as _KotlinLambdaExpression } from "./nodes/expressions/lambda.js";
import { factory } from "./nodes/factory.js";
import { KotlinNodeKind } from "./nodes/kinds.js";
import type {
  KotlinCatchClause as _KotlinCatchClause,
  KotlinValueArgument as _KotlinValueArgument,
  KotlinWhenEntry as _KotlinWhenEntry,
} from "./nodes/shared.js";
import type { KotlinStatement as _KotlinStatement } from "./nodes/statement.js";
import type { KotlinSourceFile as _KotlinSourceFile } from "./nodes/structure/source-file.js";
import type { KotlinType as _KotlinType } from "./nodes/type.js";
import type { KotlinPrinterOptions as _KotlinPrinterOptions } from "./printer.js";
import { createPrinter, printAst } from "./printer.js";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace kt {
  // Base / Core
  export type Node = _KotlinNode;
  export type NodeBase = _KotlinNodeBase;
  export type NodeKind = KotlinNodeKind;
  export type Statement = _KotlinStatement;
  export type Expression = _KotlinExpression;
  export type Declaration = _KotlinDeclaration;
  export type Type = _KotlinType;
  export type Annotation = _KotlinAnnotation;
  export type CatchClause = _KotlinCatchClause;
  export type ClassDeclaration = _KotlinClassDeclaration;
  export type EnumEntry = _KotlinEnumEntry;
  export type FunctionDeclaration = _KotlinFunctionDeclaration;
  export type LambdaExpression = _KotlinLambdaExpression;
  export type ObjectDeclaration = _KotlinObjectDeclaration;
  export type Parameter = _KotlinParameter;
  export type Property = _KotlinProperty;
  export type ValueArgument = _KotlinValueArgument;
  export type WhenEntry = _KotlinWhenEntry;

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
