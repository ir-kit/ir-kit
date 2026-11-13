import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";
import type { SwiftTupleTypeElement } from "../types/tuple-type.js";
import type { SwiftAttribute } from "./shared.js";

export type SwiftEnumCaseElement = {
  name: string;
  /** Associated values; a `{ firstName, type }` element prints labelled. */
  parameterClause?: ReadonlyArray<SwiftType | SwiftTupleTypeElement>;
  rawValue?: SwiftExpression;
};

export interface SwiftEnumCaseDeclaration extends SwiftNodeBase {
  attributes?: ReadonlyArray<SwiftAttribute>;
  elements: ReadonlyArray<SwiftEnumCaseElement>;
  kind: SwiftNodeKind.EnumCaseDeclaration;
}

export function createEnumCaseDeclaration(
  elements: ReadonlyArray<SwiftEnumCaseElement>,
  attributes?: ReadonlyArray<SwiftAttribute>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftEnumCaseDeclaration {
  return {
    attributes,
    elements,
    kind: SwiftNodeKind.EnumCaseDeclaration,
    leadingComments,
    trailingComments,
  };
}
