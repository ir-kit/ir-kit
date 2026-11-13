import type { UserConfig } from "@hey-api/openapi-ts";
import type { SpecFormat } from "../spec/convert/index.js";
import type { DocsTheme } from "../spec/docs/index.js";

interface TargetBase {
  /** Where the target writes. Relative paths start at the config file. */
  output: string;
  /** Spec for this target only. Defaults to the top-level `input`. */
  input?: string;
}

interface NativeOptions {
  /** Delete the output directory before writing. Default: `true`. */
  clean?: boolean;
  normalize?: boolean;
  /** Tag for operations that have none. Default: `"Default"`. */
  defaultTag?: string;
}

export interface GoTarget extends TargetBase, NativeOptions {
  packageName?: string;
  /** Write a `go.mod` with this module path. */
  gomod?: string;
}

export interface KotlinTarget extends TargetBase, NativeOptions {
  packageName?: string;
  /** Write a Gradle build and put sources under `src/main/kotlin`. */
  gradle?: boolean;
}

export interface JavaTarget extends TargetBase, NativeOptions {
  packageName?: string;
  gradle?: boolean;
}

export interface SwiftTarget extends TargetBase, NativeOptions {
  /** Write a `Package.swift`. */
  swiftPackage?: boolean;
}

export interface TypescriptTarget extends TargetBase {
  normalize?: boolean;
  /** Hey API plugins. Default: fetch client, types and SDK functions. */
  plugins?: UserConfig["plugins"];
  /** Any other Hey API option, applied last. */
  heyApi?: Partial<UserConfig>;
}

export interface K6Target extends TargetBase {
  normalize?: boolean;
  /** Also write one loadtest stub per operation. Stubs are never overwritten. */
  scaffold?: boolean;
  defaultBaseUrl?: string;
}

export interface DocsTarget extends TargetBase {
  theme?: DocsTheme;
  /** Input format, when it can't be told from the file. */
  from?: SpecFormat;
}

export type AsyncapiPluginName =
  | "typescript"
  | "events"
  | "event-map"
  | "dispatch"
  | "amqplib"
  | "index";

export interface AsyncapiTarget extends TargetBase {
  /** Default: all of them. */
  plugins?: ReadonlyArray<AsyncapiPluginName>;
}

export interface Targets {
  go?: GoTarget;
  kotlin?: KotlinTarget;
  swift?: SwiftTarget;
  java?: JavaTarget;
  typescript?: TypescriptTarget;
  k6?: K6Target;
  docs?: DocsTarget;
  asyncapi?: AsyncapiTarget;
}

export type TargetName = keyof Targets;

export interface IrConfig {
  /** Spec path or URL: OpenAPI, AsyncAPI, TypeSpec, protobuf or Postman. */
  input?: string;
  /** Normalize the spec before every target that supports it. */
  normalize?: boolean;
  targets: Targets;
}

/** Type helper for `ir.config.ts`. Returns `config` unchanged. */
export function defineConfig(config: IrConfig): IrConfig {
  return config;
}
