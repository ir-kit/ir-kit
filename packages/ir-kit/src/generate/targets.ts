import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { Schema } from "../schema/index.js";
import type { AsyncapiPluginName, TargetName } from "./config.js";
import { type SdkTargetName, sdkTargets } from "./sdk-targets.js";

export interface TargetContext {
  input: string;
  output: string;
  options: Record<string, unknown>;
  loadOpenAPI: (input: string) => Promise<Record<string, unknown>>;
}

export interface Target {
  /** Options the target accepts besides `input` and `output`. */
  options: ReadonlyArray<string>;
  /** `output` is one file instead of a directory. */
  file?: boolean;
  /** The target deletes files it no longer writes. */
  cleans: (options: Record<string, unknown>) => boolean;
  /** Files under `output` the target writes but the user owns afterwards. */
  userOwned?: (path: string) => boolean;
  run: (ctx: TargetContext) => Promise<void>;
}

const sdkOptions = (name: SdkTargetName) => [
  "normalize",
  ...Object.keys((sdkTargets[name] as { args: Record<string, Schema> }).args),
];

const sdk = (name: SdkTargetName, extra: Partial<Target> = {}): Target => ({
  options: sdkOptions(name),
  cleans: (options) => options.clean !== false,
  run: async ({ input, output, options, loadOpenAPI }) => {
    await sdkTargets[name].generate(await loadOpenAPI(input), {
      ...options,
      input,
      output,
    });
  },
  ...extra,
});

const ASYNCAPI_PLUGINS: ReadonlyArray<AsyncapiPluginName> = [
  "typescript",
  "events",
  "event-map",
  "dispatch",
  "amqplib",
  "index",
];

export const targets: Record<TargetName, Target> = {
  go: sdk("go"),
  kotlin: sdk("kotlin"),
  swift: sdk("swift"),
  java: sdk("java"),
  typescript: sdk("typescript", {
    options: ["normalize", "plugins", "heyApi"],
    cleans: () => true,
    run: async ({ input, output, options, loadOpenAPI }) => {
      const heyApi = options.heyApi as Record<string, unknown> | undefined;
      await sdkTargets.typescript.generate(await loadOpenAPI(input), {
        ...options,
        heyApi: {
          ...heyApi,
          output:
            heyApi?.output && typeof heyApi.output === "object"
              ? { ...heyApi.output, path: output }
              : output,
          logs: { level: "silent", ...(heyApi?.logs as object) },
        },
        input,
        output,
      });
    },
  }),
  k6: sdk("k6", {
    cleans: () => false,
    userOwned: (path) => path.startsWith("loadtests/"),
  }),
  docs: {
    options: ["theme", "from"],
    file: true,
    cleans: () => false,
    run: async ({ input, output, options }) => {
      const { renderDocs } = await import("../spec/docs/index.js");
      const { html } = await renderDocs({
        input,
        theme: options.theme as never,
        from: options.from as never,
      });
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, html);
    },
  },
  asyncapi: {
    options: ["plugins"],
    cleans: () => false,
    run: async ({ input, output, options }) => {
      const sdkAsyncapi = await import("../sdk/asyncapi/index.js");
      const factories = {
        typescript: sdkAsyncapi.typescript,
        events: sdkAsyncapi.events,
        "event-map": sdkAsyncapi.eventMap,
        dispatch: sdkAsyncapi.dispatch,
        amqplib: sdkAsyncapi.amqplib,
        index: sdkAsyncapi.indexBarrel,
      };
      const names =
        (options.plugins as ReadonlyArray<AsyncapiPluginName> | undefined) ??
        ASYNCAPI_PLUGINS;
      const plugins = names.map((name) => {
        const factory = factories[name];
        if (!factory) {
          throw new Error(
            `Unknown asyncapi plugin "${name}". Available: ${ASYNCAPI_PLUGINS.join(", ")}`,
          );
        }
        return factory();
      });
      await sdkAsyncapi.generate({ input, output, plugins });
    },
  },
};

export const TARGET_NAMES = Object.keys(targets) as TargetName[];
