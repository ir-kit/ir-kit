import { generate as generateGo } from "@ir-kit/openapi-go";
import { generate as generateJava } from "@ir-kit/openapi-java";
import { generate as generateKotlin } from "@ir-kit/openapi-kotlin";
import { generate as generateSwift } from "@ir-kit/openapi-swift";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";

export interface NativeSdkInput {
  input: string;
  output: string;
  clean?: boolean;
  normalize?: boolean;
  defaultTag?: string;
  [option: string]: unknown;
}

interface NativeSdkTarget {
  label: string;
  /** Options only this target understands, as CLI args. */
  args: Record<string, Schema>;
  generate: (
    doc: Record<string, unknown>,
    input: NativeSdkInput,
  ) => Promise<unknown>;
}

const str = (o: unknown): string | undefined =>
  typeof o === "string" ? o : undefined;
const bool = (o: unknown): boolean | undefined =>
  typeof o === "boolean" ? o : undefined;

const common = (doc: Record<string, unknown>, input: NativeSdkInput) => ({
  input: doc,
  output: input.output,
  clean: input.clean,
  normalize: input.normalize,
  defaultTag: input.defaultTag,
});

const gradleArgs = (lang: string): Record<string, Schema> => ({
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

export const nativeSdkTargets = {
  go: {
    label: "Go",
    args: {
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
    label: "Kotlin",
    args: gradleArgs("Kotlin"),
    generate: (doc, input) =>
      generateKotlin({
        ...common(doc, input),
        packageName: str(input.packageName),
        gradle: bool(input.gradle),
      }),
  },
  swift: {
    label: "Swift",
    args: {
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
    label: "Java",
    args: gradleArgs("Java"),
    generate: (doc, input) =>
      generateJava({
        ...common(doc, input),
        packageName: str(input.packageName),
        gradle: bool(input.gradle),
      }),
  },
} satisfies Record<string, NativeSdkTarget>;

export type NativeSdkTargetName = keyof typeof nativeSdkTargets;

function nativeSdkCommand(
  name: NativeSdkTargetName,
): CommandSpec<NativeSdkInput, void> {
  const target: NativeSdkTarget = nativeSdkTargets[name];
  return {
    path: ["sdk", name],
    description: `Generate a ${target.label} SDK from an OpenAPI / TypeSpec spec`,
    args: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "OpenAPI spec path, URL, or .tsp file",
        },
        output: { type: "string", description: "Output directory" },
        clean: {
          type: "boolean",
          description: "Wipe output directory before writing",
          default: true,
        },
        normalize: {
          type: "boolean",
          description: "Apply spec normalization",
          default: false,
        },
        defaultTag: {
          type: "string",
          description: "Tag used when an op has none (default: 'Default')",
        },
        ...target.args,
      },
      required: ["input", "output"],
    },
    handler: async (input) => {
      await target.generate(await loadOpenAPIForSdk(input.input), input);
    },
  };
}

export const sdkGoCommand = nativeSdkCommand("go");
export const sdkKotlinCommand = nativeSdkCommand("kotlin");
export const sdkSwiftCommand = nativeSdkCommand("swift");
export const sdkJavaCommand = nativeSdkCommand("java");
