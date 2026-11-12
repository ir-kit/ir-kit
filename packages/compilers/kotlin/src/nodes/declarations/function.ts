import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinModifier } from "../shared.js";
import type { KotlinStatement } from "../statement.js";
import type { KotlinType } from "../type.js";
import type { KotlinTypeParameter } from "../types/type-parameter.js";
import type { KotlinAnnotation } from "./annotation.js";
import type { KotlinParameter } from "./parameter.js";

export interface KotlinFunctionDeclaration extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  body?: ReadonlyArray<KotlinStatement>;
  expressionBody?: KotlinExpression;
  kind: KotlinNodeKind.FunctionDeclaration;
  modifiers?: ReadonlyArray<KotlinModifier>;
  name: string;
  parameters?: ReadonlyArray<KotlinParameter>;
  receiverType?: KotlinType;
  returnType?: KotlinType;
  typeParameters?: ReadonlyArray<KotlinTypeParameter>;
}

export function createFunctionDeclaration(
  name: string,
  parameters?: ReadonlyArray<KotlinParameter>,
  returnType?: KotlinType,
  body?: ReadonlyArray<KotlinStatement>,
  expressionBody?: KotlinExpression,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  receiverType?: KotlinType,
  typeParameters?: ReadonlyArray<KotlinTypeParameter>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinFunctionDeclaration {
  return {
    annotations,
    body,
    expressionBody,
    kind: KotlinNodeKind.FunctionDeclaration,
    leadingComments,
    modifiers,
    name,
    parameters,
    receiverType,
    returnType,
    trailingComments,
    typeParameters,
  };
}
