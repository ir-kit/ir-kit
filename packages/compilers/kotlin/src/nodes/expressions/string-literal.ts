import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinStringTemplateEntry } from '../shared';

export interface KotlinStringLiteral extends KotlinNodeBase {
  entries: ReadonlyArray<KotlinStringTemplateEntry>;
  kind: KotlinNodeKind.StringLiteral;
  multiline?: boolean;
}

export function createStringLiteral(
  entries: ReadonlyArray<KotlinStringTemplateEntry>,
  multiline?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinStringLiteral {
  return {
    entries,
    kind: KotlinNodeKind.StringLiteral,
    leadingComments,
    multiline,
    trailingComments,
  };
}
