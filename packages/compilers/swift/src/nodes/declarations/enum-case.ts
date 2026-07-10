import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';
import type { SwiftAttribute } from './shared';

export type SwiftEnumCaseElement = {
  name: string;
  parameterClause?: ReadonlyArray<SwiftType>;
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
