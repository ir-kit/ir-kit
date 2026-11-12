import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinModifier, KotlinValOrVar } from "../shared.js";
import type { KotlinType } from "../type.js";
import type { KotlinAnnotation } from "./annotation.js";

export interface KotlinParameter extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  defaultValue?: KotlinExpression;
  kind: KotlinNodeKind.Parameter;
  modifiers?: ReadonlyArray<KotlinModifier>;
  name: string;
  type: KotlinType;
  valOrVar?: KotlinValOrVar;
}

export function createParameter(
  name: string,
  type: KotlinType,
  defaultValue?: KotlinExpression,
  valOrVar?: KotlinValOrVar,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinParameter {
  return {
    annotations,
    defaultValue,
    kind: KotlinNodeKind.Parameter,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    type,
    valOrVar,
  };
}
