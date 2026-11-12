import { join } from "node:path";
import { generate as generateK6 } from "@ir-kit/k6-gen";
import { generate as generateTypescript } from "@ir-kit/openapi-typescript";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";
import { type NativeSdkTargetName, nativeSdkTargets } from "./sdk-native.js";

const TARGETS = [
  ...(Object.keys(nativeSdkTargets) as NativeSdkTargetName[]),
  "typescript",
  "k6",
] as const;
type Target = (typeof TARGETS)[number];

interface Input {
  input: string;
  output: string;
  targets?: string;
  clean?: boolean;
  normalize?: boolean;
}

const args: Schema = {
  type: "object",
  properties: {
    input: {
      type: "string",
      description: "OpenAPI spec path, URL, or .tsp file",
    },
    output: {
      type: "string",
      description: "Root output directory (per-target subdirs created)",
    },
    targets: {
      type: "string",
      description: `Comma-separated targets (default: all). Available: ${TARGETS.join(", ")}`,
      default: TARGETS.join(","),
    },
    clean: {
      type: "boolean",
      description: "Wipe each target dir before writing",
      default: true,
    },
    normalize: {
      type: "boolean",
      description: "Apply spec normalization",
      default: false,
    },
  },
  required: ["input", "output"],
};

export const sdkAllCommand: CommandSpec<Input, void> = {
  path: ["sdk", "all"],
  description: "Generate SDKs for multiple targets in one pass",
  args,
  handler: async (input) => {
    const requested = (input.targets ?? TARGETS.join(","))
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    for (const t of requested) {
      if (!(TARGETS as ReadonlyArray<string>).includes(t)) {
        throw new Error(
          `Unknown target: ${t}. Available: ${TARGETS.join(", ")}`,
        );
      }
    }
    const targets = requested as ReadonlyArray<Target>;
    const native = targets.some((t) => t in nativeSdkTargets)
      ? await loadOpenAPIForSdk(input.input)
      : undefined;

    for (const target of targets) {
      const out = join(input.output, target);
      const common = {
        input: input.input,
        output: out,
        clean: input.clean,
        normalize: input.normalize,
      };
      if (native && target in nativeSdkTargets)
        await nativeSdkTargets[target as NativeSdkTargetName].generate(
          native,
          common,
        );
      else if (target === "typescript")
        await generateTypescript({
          input: input.input,
          output: out,
          normalize: input.normalize,
        });
      else if (target === "k6")
        await generateK6({
          input: input.input,
          output: out,
          normalize: input.normalize,
        });
      process.stdout.write(`✓ ${target} → ${out}\n`);
    }
  },
};
