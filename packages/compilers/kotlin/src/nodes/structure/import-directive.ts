import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';

export interface KotlinImportDirective extends KotlinNodeBase {
  alias?: string;
  identifier: string;
  isWildcard?: boolean;
  kind: KotlinNodeKind.ImportDirective;
}

export function createImportDirective(
  identifier: string,
  alias?: string,
  isWildcard?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinImportDirective {
  return {
    alias,
    identifier,
    isWildcard,
    kind: KotlinNodeKind.ImportDirective,
    leadingComments,
    trailingComments,
  };
}
