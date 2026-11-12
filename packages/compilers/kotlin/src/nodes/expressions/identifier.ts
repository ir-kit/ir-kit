import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinIdentifier extends KotlinNodeBase {
  kind: KotlinNodeKind.Identifier;
  name: string;
}

export function createIdentifier(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinIdentifier {
  return {
    kind: KotlinNodeKind.Identifier,
    leadingComments,
    name,
    trailingComments,
  };
}
