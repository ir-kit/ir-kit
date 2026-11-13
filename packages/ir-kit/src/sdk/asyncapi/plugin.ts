/**
 * Plugin contract for `@ir-kit/kit/sdk/asyncapi`.
 *
 * Shape mirrors `@hey-api/openapi-ts`'s `definePluginConfig` / plugin
 * instance pattern, adapted to AsyncAPI primitives. Plugins are
 * authored as definitions and registered via factory call:
 *
 *   export const myPlugin = definePluginConfig({
 *     name: "my-plugin",
 *     defaultConfig: { ... },
 *     dependsOn: ["typescript"],
 *     handler: async (plugin) => {
 *       for (const ev of plugin.forEach("message")) { ... }
 *       plugin.emit({ path: "out.gen.ts", content: "..." });
 *     },
 *   });
 *
 *   // caller:
 *   generate({ plugins: [myPlugin({ ... }), ...], ... });
 */

import type {
  AsyncAPIDocumentInterface,
  ChannelInterface,
  MessageInterface,
  OperationInterface,
} from "@asyncapi/parser";
import type { TsDsl } from "@hey-api/openapi-ts";

export interface GeneratedFile {
  /** Path relative to the configured output directory. */
  path: string;
  content: string;
}

/**
 * One named-import group. The `from` path is the logical (extension-free)
 * file path of another plugin's file in the same project — e.g. the
 * `events` plugin emits `events.gen.ts`, so reference it as `"events.gen"`.
 * The renderer resolves that to a relative path between source and importer
 * at print time.
 */
export interface EmitTsImportGroup {
  /** Logical path of the source file (no extension). */
  from: string;
  /** Names being imported. `isType` adds a per-specifier `type` modifier. */
  names: ReadonlyArray<{ name: string; isType?: boolean }>;
  /** Top-level `import type { ... }` (vs `import { ..., type X }`). */
  isType?: boolean;
}

/** One re-export group: `export { a, type B } from "./mod"`, or `export * from "./mod"` without `names`. */
export interface EmitTsExportGroup {
  /** Module specifier exactly as written (e.g. `"./events.gen.js"`). */
  from: string;
  /** Names being re-exported. Omit to re-export everything. */
  names?: ReadonlyArray<{ name: string; isType?: boolean }>;
  /** Top-level `export type` (vs per-specifier `type`). */
  isType?: boolean;
}

export interface EmitTsOptions {
  /** Comment block printed above the imports. */
  header?: string;
  /** Imports from other generated files. */
  imports?: ReadonlyArray<EmitTsImportGroup>;
  /** Re-exports printed after the imports. */
  exports?: ReadonlyArray<EmitTsExportGroup>;
}

export type ForEachKind = "message" | "channel" | "operation";

export type ForEachEvent =
  | { type: "message"; message: MessageInterface }
  | { type: "channel"; channel: ChannelInterface }
  | { type: "operation"; operation: OperationInterface };

/**
 * What a plugin's handler receives. Strongly typed against the plugin's
 * own `Config` and `Api` so config / api access doesn't degrade to `any`.
 */
export interface PluginInstance<Config = unknown, Api = unknown> {
  /** Plugin's stable identifier. */
  readonly name: string;
  /** Resolved config — defaults merged with user overrides (and `resolveConfig`). */
  readonly config: Config;
  /** Plugin's own api object — typed straight through from the definition. */
  readonly api: Api;
  /** The parsed AsyncAPI document. */
  readonly document: AsyncAPIDocumentInterface;
  /** Files emitted so far (by this and prior plugins). */
  readonly files: ReadonlyArray<GeneratedFile>;
  /** Add a file to the output as raw text. Use for generated text and copied bundles. */
  emit(file: GeneratedFile): void;
  /**
   * Add a file built with Hey API's `$` DSL; the `TsStatementRenderer`
   * prints it at render time. Strings are printed as-is after the DSL
   * nodes, for code the DSL can't build. Optional
   * `header` prints above the imports.
   *
   * Cross-file imports go through `options.imports` (graph-driven), not
   * inline import statements — the underlying codegen-core
   * `File.addImport` resolves source files into relative paths at print
   * time, so imports survive file moves and rename collision resolution.
   */
  emitTs(
    path: string,
    nodes: ReadonlyArray<TsDsl | string>,
    options?: EmitTsOptions,
  ): void;
  /** Look up another plugin's api by name. Returns `undefined` if absent. */
  getApi<T = unknown>(name: string): T | undefined;
  /** Iterate spec entities of the given kinds, in document order. */
  forEach(...kinds: ForEachKind[]): IterableIterator<ForEachEvent>;
}

export interface PluginHooks<Config = unknown, Api = unknown> {
  before?: (plugin: PluginInstance<Config, Api>) => Promise<void> | void;
  after?: (plugin: PluginInstance<Config, Api>) => Promise<void> | void;
}

/**
 * Plugin author's contract. Pass to `definePluginConfig` to get a
 * factory that callers invoke when building their plugin list.
 */
export interface PluginDefinition<
  Name extends string = string,
  UserConfig = unknown,
  ResolvedConfig = UserConfig,
  Api = unknown,
> {
  /** Stable identifier — used in `dependsOn`, `getApi`, log messages. */
  name: Name;
  /** Baseline config; user overrides are layered on top. */
  defaultConfig: ResolvedConfig;
  /**
   * Optional. Compute the final config from user input + document
   * context (e.g. inspect installed package versions, infer features
   * from the spec). Default behavior is shallow-merge of user over
   * defaults.
   */
  resolveConfig?: (
    user: Partial<UserConfig> | undefined,
    context: { document: AsyncAPIDocumentInterface },
  ) => ResolvedConfig;
  /** API surface other plugins can fetch via `plugin.getApi(name)`. */
  api?: Api;
  /** Like `api`, but built fresh for each `generate()` run so the plugin can hold per-run state. */
  createApi?: () => Api;
  hooks?: PluginHooks<ResolvedConfig, Api>;
  /** Names of plugins this one depends on. The orchestrator topologically sorts. */
  dependsOn?: ReadonlyArray<string>;
  /** The actual codegen work. */
  handler: (
    plugin: PluginInstance<ResolvedConfig, Api>,
  ) => Promise<void> | void;
}

/** What the orchestrator receives — a sealed instance ready to run. */
export interface RegisteredPlugin<
  Name extends string = string,
  UserConfig = unknown,
  ResolvedConfig = UserConfig,
  Api = unknown,
> {
  readonly __definition: PluginDefinition<
    Name,
    UserConfig,
    ResolvedConfig,
    Api
  >;
  readonly __userConfig: Partial<UserConfig> | undefined;
  readonly name: Name;
}

/**
 * Generic-erased view used at orchestration boundaries.
 *
 * `RegisteredPlugin<X>` types can't be uniformly stored in an array
 * because hooks are contravariant in `Config`. This widening alias
 * uses `any` deliberately — internal to the orchestrator, not exposed
 * to plugin authors (who keep full type safety).
 */
// biome-ignore lint/suspicious/noExplicitAny: variance erasure for plugin storage
export type AnyRegisteredPlugin = RegisteredPlugin<string, any, any, any>;

/**
 * Wrap a plugin definition into a factory. Author exports the returned
 * factory; caller invokes it (with optional config overrides) when
 * building the `plugins` array.
 */
export function definePluginConfig<
  Name extends string,
  UserConfig,
  ResolvedConfig,
  Api,
>(
  def: PluginDefinition<Name, UserConfig, ResolvedConfig, Api>,
): (
  config?: Partial<UserConfig>,
) => RegisteredPlugin<Name, UserConfig, ResolvedConfig, Api> {
  return (config?: Partial<UserConfig>) => ({
    __definition: def,
    __userConfig: config,
    name: def.name,
  });
}

/** Convenience: orchestrator-internal `forEach` implementation. */
export function* iterateDocument(
  document: AsyncAPIDocumentInterface,
  kinds: ReadonlyArray<ForEachKind>,
): IterableIterator<ForEachEvent> {
  if (kinds.includes("channel")) {
    for (const channel of document.channels().all()) {
      yield { type: "channel", channel };
    }
  }
  if (kinds.includes("operation")) {
    for (const operation of document.operations().all()) {
      yield { type: "operation", operation };
    }
  }
  if (kinds.includes("message")) {
    for (const message of document.allMessages().all()) {
      yield { type: "message", message };
    }
  }
}
