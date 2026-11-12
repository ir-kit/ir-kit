import type { GoType } from "../type.js";

export type GoTypeParameter = {
  constraint: GoType;
  names: ReadonlyArray<string>;
};
