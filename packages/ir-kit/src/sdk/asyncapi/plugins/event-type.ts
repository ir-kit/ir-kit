import type { MessageInterface } from "@asyncapi/parser";
import { messageId } from "../../../ir/asyncapi.js";

/** Event-type literal for a message: its `title`, else `name`, else id. */
export function inferEventType(message: MessageInterface): string {
  return message.title?.() || message.name?.() || messageId(message);
}
