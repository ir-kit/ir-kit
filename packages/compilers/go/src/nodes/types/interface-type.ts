import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";
import type { GoFunctionParameter } from "./function-parameter.js";
import type { GoFunctionReturn } from "./function-return.js";

export type GoInterfaceMethod = {
  leadingComments?: ReadonlyArray<string>;
  name: string;
  parameters: ReadonlyArray<GoFunctionParameter>;
  returnType: ReadonlyArray<GoFunctionReturn>;
};

export type GoInterfaceEmbed = {
  embed: GoExpression | GoType;
  leadingComments?: ReadonlyArray<string>;
};

export type GoInterfaceField = GoInterfaceEmbed | GoInterfaceMethod;

export interface GoInterfaceType extends GoNodeBase {
  fields: ReadonlyArray<GoInterfaceField>;
  kind: GoNodeKind.InterfaceType;
}

export function createInterfaceType(
  fields: ReadonlyArray<GoInterfaceField> | undefined,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoInterfaceType {
  return {
    fields: fields ?? [],
    kind: GoNodeKind.InterfaceType,
    leadingComments,
    trailingComments,
  };
}
