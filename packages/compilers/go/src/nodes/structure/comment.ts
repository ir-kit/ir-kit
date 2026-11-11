import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";

export interface GoComment extends GoNodeBase {
  kind: GoNodeKind.Comment;
  text: string;
}

export function createComment(text: string): GoComment {
  return { kind: GoNodeKind.Comment, text };
}
