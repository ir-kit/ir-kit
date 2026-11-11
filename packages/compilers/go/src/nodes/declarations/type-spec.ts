import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';
import type { GoTypeParameter } from './type-parameter';

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
