import type { MessageInterface } from "@asyncapi/parser";

/** Event-type literal for a message: its `title`, else `name`, else id. */
export function inferEventType(message: MessageInterface): string {
  return message.title?.() || message.name?.() || message.id();
}
