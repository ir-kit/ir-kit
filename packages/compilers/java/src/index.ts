import type { JavaEnumConstant as _JavaEnumConstant } from "./nodes/declarations/enum.js";
import type { JavaMethodDeclaration as _JavaMethodDeclaration } from "./nodes/declarations/method.js";
import type { JavaMethodParameter as _JavaMethodParameter } from "./nodes/declarations/method-parameter.js";
import type { JavaExpression as _JavaExpression } from "./nodes/expression.js";
import type { JavaLambdaParameter as _JavaLambdaParameter } from "./nodes/expressions/lambda.js";
import { factory } from "./nodes/factory.js";
import { JavaNodeKind } from "./nodes/kinds.js";
import type { JavaStatement as _JavaStatement } from "./nodes/statement.js";
import { createPrinter, printAst } from "./printer.js";

export const java = {
  JavaNodeKind,
  createPrinter,
  factory,
  printAst,
} as const;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace java {
  export type Expression = _JavaExpression;
  export type Statement = _JavaStatement;
  export type EnumConstant = _JavaEnumConstant;
  export type LambdaParameter = _JavaLambdaParameter;
  export type MethodDeclaration = _JavaMethodDeclaration;
  export type MethodParameter = _JavaMethodParameter;
}
