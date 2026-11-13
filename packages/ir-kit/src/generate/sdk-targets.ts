import type { Schema } from "../schema/index.js";
import { generate as generateGo } from "../sdk/go/index.js";
import { generate as generateJava } from "../sdk/java/index.js";
import { generate as generateK6 } from "../sdk/k6/index.js";
import { generate as generateKotlin } from "../sdk/kotlin/index.js";
import { generate as generateSwift } from "../sdk/swift/index.js";
import {
  generate as generateTypescript,
  type GenerateOptions as TypescriptOptions,
} from "../sdk/typescript/index.js";

export interface SdkInput {
  input: string;
  output: string;
  clean?: boolean;
  normalize?: boolean;
  defaultTag?: string;
  [option: string]: unknown;
}

export interface SdkTarget {
  /** One-line command description. */
  description: string;
  /** Options only this target understands, as CLI args. */
  args: Record<string, Schema>;
  generate: (doc: Record<string, unknown>, input: SdkInput) => Promise<unknown>;
}

const str = (o: unknown): string | undefined =>
  typeof o === "string" ? o : undefined;
const bool = (o: unknown): boolean | undefined =>
  typeof o === "boolean" ? o : undefined;

const common = (doc: Record<string, unknown>, input: SdkInput) => ({
  input: doc,
  output: input.output,
  clean: input.clean,
  normalize: input.normalize,
  defaultTag: input.defaultTag,
});

const nativeArgs: Record<string, Schema> = {
  clean: {
    type: "boolean",
    description: "Wipe output directory before writing",
    default: true,
  },
  defaultTag: {
    type: "string",
    description: "Tag used when an op has none (default: 'Default')",
  },
};

const native = (lang: string) =>
  `Generate a ${lang} SDK from an OpenAPI / TypeSpec spec`;

const gradleArgs = (lang: string): Record<string, Schema> => ({
  ...nativeArgs,
  gradle: {
    type: "boolean",
    description: "Emit build.gradle.kts + settings.gradle.kts at output root",
    default: false,
  },
  packageName: {
    type: "string",
    description: `${lang} package name (default: 'com.example.api')`,
  },
});

export const sdkTargets = {
  go: {
    description: native("Go"),
    args: {
      ...nativeArgs,
      gomod: {
        type: "string",
        description:
          "Emit go.mod with this module path (e.g. github.com/me/sdk)",
      },
      packageName: {
        type: "string",
        description: "Go package name (default: 'api')",
      },
    },
    generate: (doc, input) => {
      const gomod = str(input.gomod);
      return generateGo({
        ...common(doc, input),
        packageName: str(input.packageName),
        ...(gomod ? { gomod: { module: gomod } } : {}),
      });
    },
  },
  kotlin: {
    description: native("Kotlin"),
    args: gradleArgs("Kotlin"),
    generate: (doc, input) =>
      generateKotlin({
        ...common(doc, input),
        packageName: str(input.packageName),
        gradle: bool(input.gradle),
      }),
  },
  swift: {
    description: native("Swift"),
    args: {
      ...nativeArgs,
      swiftPackage: {
        type: "boolean",
        description: "Emit Package.swift at output root",
        default: false,
      },
    },
    generate: (doc, input) =>
      generateSwift({
        ...common(doc, input),
        package: bool(input.swiftPackage),
      }),
  },
  java: {
    description: native("Java"),
    args: gradleArgs("Java"),
    generate: (doc, input) =>
      generateJava({
        ...common(doc, input),
        packageName: str(input.packageName),
        gradle: bool(input.gradle),
      }),
  },
  typescript: {
    description: "Generate a TypeScript SDK (delegates to @hey-api/openapi-ts)",
    args: {},
    generate: (doc, input) =>
      generateTypescript({
        input: doc,
        output: input.output,
        normalize: input.normalize,
        plugins: input.plugins as TypescriptOptions["plugins"],
        heyApi: input.heyApi as TypescriptOptions["heyApi"],
      }),
  },
  k6: {
    description:
      "Generate a typed k6 client + types + faker-backed data builders",
    args: {
      scaffold: {
        type: "boolean",
        description: "Also emit per-operation loadtest stubs",
        default: false,
      },
      defaultBaseUrl: {
        type: "string",
        description: "Default base URL (falls back to spec.servers[0].url)",
      },
    },
    generate: (doc, input) =>
      generateK6({
        input: doc,
        output: input.output,
        normalize: input.normalize,
        scaffold: bool(input.scaffold),
        defaultBaseUrl: str(input.defaultBaseUrl),
      }),
  },
} satisfies Record<string, SdkTarget>;

export type SdkTargetName = keyof typeof sdkTargets;
