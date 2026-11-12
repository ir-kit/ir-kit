import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaComment extends JavaNodeBase {
  kind: JavaNodeKind.Comment;
  text: string;
}

export function createComment(text: string): JavaComment {
  return { kind: JavaNodeKind.Comment, text };
}
