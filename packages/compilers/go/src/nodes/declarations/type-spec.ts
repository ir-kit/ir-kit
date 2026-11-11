import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";
import type { GoTypeParameter } from "./type-parameter.js";

export interface GoTypeSpec extends GoNodeBase {
  isAlias?: boolean;
  kind: GoNodeKind.TypeSpec;
  name: string;
  type: GoType;
  typeParameters?: ReadonlyArray<GoTypeParameter>;
}

export function createTypeSpec(
  name: string,
  type: GoType,
  typeParameters?: ReadonlyArray<GoTypeParameter>,
  isAlias?: boolean,
): GoTypeSpec {
  return {
    isAlias,
    kind: GoNodeKind.TypeSpec,
    name,
    type,
    typeParameters,
  };
}
