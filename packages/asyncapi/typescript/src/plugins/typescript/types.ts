export interface TypescriptPluginConfig {
  /** Suffix appended to message ids for the message-level interface name. Default: `"Message"`. */
  messageSuffix?: string;
}

export interface TypescriptResolvedConfig {
  messageSuffix: string;
}

export interface TypescriptApi {
  /** Name of the interface generated for a message's payload, or `undefined` when the message has no payload. */
  messageTypeName(messageId: string): string | undefined;
}
