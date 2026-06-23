import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaComment extends JavaNodeBase {
  kind: JavaNodeKind.Comment;
  text: string;
}

export function createComment(text: string): JavaComment {
  return { kind: JavaNodeKind.Comment, text };
}
