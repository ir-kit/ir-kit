import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";
import type { SwiftAccessorBlock } from "./accessor-block.js";
import type { SwiftAttribute, SwiftModifier } from "./shared.js";

export type SwiftBindingSpecifier = "let" | "var";

export type SwiftPatternBinding = {
  accessorBlock?: SwiftAccessorBlock;
  initializer?: SwiftExpression;
  pattern: string;
  typeAnnotation?: SwiftType;
};

export interface SwiftVariableDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  bindingSpecifier: SwiftBindingSpecifier;
  bindings: ReadonlyArray<SwiftPatternBinding>;
  kind: SwiftNodeKind.VariableDeclaration;
  modifiers?: ReadonlyArray<SwiftModifier>;
}

export function createVariableDeclaration(
  bindingSpecifier: SwiftBindingSpecifier,
  bindings: ReadonlyArray<SwiftPatternBinding>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  modifiers?: ReadonlyArray<SwiftModifier>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftVariableDeclaration {
  return {
    attributes,
    bindingSpecifier,
    bindings,
    kind: SwiftNodeKind.VariableDeclaration,
    leadingComments,
    modifiers,
    trailingComments,
  };
}
