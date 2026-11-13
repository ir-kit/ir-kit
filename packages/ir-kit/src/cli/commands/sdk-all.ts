import { join } from "node:path";
import type { Schema } from "../../schema/index.js";

import type { CommandSpec } from "../command-spec.js";
import { loadOpenAPIForSdk } from "./_load-openapi.js";
import { type SdkTargetName, sdkTargets } from "./sdk-targets.js";

const TARGETS = Object.keys(sdkTargets) as SdkTargetName[];

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
    const doc = await loadOpenAPIForSdk(input.input);
    for (const target of requested as SdkTargetName[]) {
      const out = join(input.output, target);
      await sdkTargets[target].generate(doc, {
        input: input.input,
        output: out,
        clean: input.clean,
        normalize: input.normalize,
      });
      process.stdout.write(`✓ ${target} → ${out}\n`);
    }
  },
};
