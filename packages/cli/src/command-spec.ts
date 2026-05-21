import type { Schema } from "@ir-kit/schema";

export type OutputFormat = "none" | "json" | "yaml" | "table";

export interface CommandSpec<TInput, TOutput> {
  path: ReadonlyArray<string>;
  description: string;
  args: Schema;
  output?: Schema;
  handler: (input: TInput) => Promise<TOutput>;
}

export type AnyCommandSpec = CommandSpec<any, any>;
