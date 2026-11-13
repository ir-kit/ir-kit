import { loadOpenAPIForSdk } from "../../generate/load-openapi.js";
import {
  type SdkInput,
  type SdkTarget,
  type SdkTargetName,
  sdkTargets,
} from "../../generate/sdk-targets.js";
import type { CommandSpec } from "../command-spec.js";

function sdkCommand(name: SdkTargetName): CommandSpec<SdkInput, void> {
  const target: SdkTarget = sdkTargets[name];
  return {
    path: ["sdk", name],
    description: target.description,
    args: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "OpenAPI spec path, URL, or .tsp file",
        },
        output: { type: "string", description: "Output directory" },
        normalize: {
          type: "boolean",
          description: "Apply spec normalization",
          default: false,
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

export const sdkGoCommand = sdkCommand("go");
export const sdkKotlinCommand = sdkCommand("kotlin");
export const sdkSwiftCommand = sdkCommand("swift");
export const sdkJavaCommand = sdkCommand("java");
export const sdkTypescriptCommand = sdkCommand("typescript");
export const sdkK6Command = sdkCommand("k6");

/** One `ir sdk <target>` command per entry in {@link sdkTargets}. */
export const sdkCommands = [
  sdkGoCommand,
  sdkKotlinCommand,
  sdkSwiftCommand,
  sdkJavaCommand,
  sdkTypescriptCommand,
  sdkK6Command,
];
