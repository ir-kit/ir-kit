import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";
import type { SwiftAccessorBlock } from "./accessor-block.js";
import type { SwiftFunctionParameter } from "./function.js";
import type {
  SwiftAttribute,
  SwiftGenericParameter,
  SwiftGenericRequirement,
  SwiftModifier,
} from "./shared.js";

export interface SwiftSubscriptDeclaration extends SwiftNodeBase {
  accessorBlock: SwiftAccessorBlock;
  attributes?: ReadonlyArray<SwiftAttribute>;
  genericParameters?: ReadonlyArray<SwiftGenericParameter>;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  kind: SwiftNodeKind.SubscriptDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
  parameters: ReadonlyArray<SwiftFunctionParameter>;
  returnType: SwiftType;
}

export function createSubscriptDeclaration(
  parameters: ReadonlyArray<SwiftFunctionParameter>,
  returnType: SwiftType,
  accessorBlock: SwiftAccessorBlock,
  modifiers?: ReadonlyArray<SwiftModifier>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericParameters?: ReadonlyArray<SwiftGenericParameter>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSubscriptDeclaration {
  return {
    accessorBlock,
    attributes,
    genericParameters,
    genericWhereClause,
    kind: SwiftNodeKind.SubscriptDeclaration,
    leadingComments,
    modifiers,
    parameters,
    returnType,
    trailingComments,
  };
}
