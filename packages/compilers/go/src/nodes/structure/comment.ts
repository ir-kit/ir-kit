import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export interface GoComment extends GoNodeBase {
  kind: GoNodeKind.Comment;
  text: string;
}

export function createComment(text: string): GoComment {
  return { kind: GoNodeKind.Comment, text };
}
