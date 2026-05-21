import { join } from "node:path";
import { generate as generateK6 } from "@ir-kit/k6-gen";
import { generate as generateGo } from "@ir-kit/openapi-go";
import { generate as generateKotlin } from "@ir-kit/openapi-kotlin";
import { generate as generateSwift } from "@ir-kit/openapi-swift";
import { generate as generateTypescript } from "@ir-kit/openapi-typescript";
import type { Schema } from "@ir-kit/schema";

import type { CommandSpec } from "../command-spec.js";

const TARGETS = ["go", "kotlin", "swift", "typescript", "k6"] as const;
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

    for (const target of targets) {
      const out = join(input.output, target);
      const common = {
        input: input.input,
        output: out,
        clean: input.clean,
        normalize: input.normalize,
      };
      if (target === "go") await generateGo(common);
      else if (target === "kotlin") await generateKotlin(common);
      else if (target === "swift") await generateSwift(common);
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
