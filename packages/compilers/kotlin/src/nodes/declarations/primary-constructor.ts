import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinModifier } from "../shared.js";
import type { KotlinAnnotation } from "./annotation.js";
import type { KotlinParameter } from "./parameter.js";

export interface KotlinPrimaryConstructor extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  kind: KotlinNodeKind.PrimaryConstructor;
  modifiers?: ReadonlyArray<KotlinModifier>;
  parameters: ReadonlyArray<KotlinParameter>;
}

export function createPrimaryConstructor(
  parameters: ReadonlyArray<KotlinParameter>,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinPrimaryConstructor {
  return {
    annotations,
    kind: KotlinNodeKind.PrimaryConstructor,
    leadingComments,
    modifiers,
    parameters,
    trailingComments,
  };
}
