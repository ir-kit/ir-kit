import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinLiteralKind } from '../shared';

export interface KotlinLiteral extends KotlinNodeBase {
  kind: KotlinNodeKind.Literal;
  literalKind: KotlinLiteralKind;
  text: string;
}

export function createLiteral(
  text: string,
  literalKind: KotlinLiteralKind,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinLiteral {
  return {
    kind: KotlinNodeKind.Literal,
    leadingComments,
    literalKind,
    text,
    trailingComments,
  };
}
