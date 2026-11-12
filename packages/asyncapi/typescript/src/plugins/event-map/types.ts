export interface EventMapPluginConfig {
  /** @deprecated Ignored; message interface names come from the `typescript` plugin. */
  messageSuffix?: string;
}

export type EventMapResolvedConfig = Record<string, never>;
