import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';

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
