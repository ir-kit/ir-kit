import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";
import type {
  SwiftEffectSpecifiers,
  SwiftFunctionParameter,
} from "./function.js";
import type {
  SwiftAttribute,
  SwiftGenericRequirement,
  SwiftModifier,
} from "./shared.js";

export interface SwiftInitializerDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  body: ReadonlyArray<SwiftStatement>;
  effectSpecifiers?: SwiftEffectSpecifiers;
  failable?: boolean;
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>;
  kind: SwiftNodeKind.InitializerDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
  parameters: ReadonlyArray<SwiftFunctionParameter>;
}

export function createInitializerDeclaration(
  parameters: ReadonlyArray<SwiftFunctionParameter>,
  body: ReadonlyArray<SwiftStatement>,
  failable?: boolean,
  modifiers?: ReadonlyArray<SwiftModifier>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  genericWhereClause?: ReadonlyArray<SwiftGenericRequirement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftInitializerDeclaration {
  return {
    attributes,
    body,
    failable,
    genericWhereClause,
    kind: SwiftNodeKind.InitializerDeclaration,
    leadingComments,
    modifiers,
    parameters,
    trailingComments,
  };
}
