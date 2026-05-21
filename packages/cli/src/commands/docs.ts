import { writeFile } from "node:fs/promises";

import type { Schema } from "@ir-kit/schema";
import { renderDocs } from "@ir-kit/spec-docs";

import type { CommandSpec } from "../command-spec.js";

interface Input {
  input: string;
  out?: string;
  theme?: string;
  from?: string;
}

const themes = [
  "default",
  "alternate",
  "moon",
  "purple",
  "solarized",
  "bluePlanet",
  "saturn",
  "kepler",
  "mars",
  "deepSpace",
  "none",
];

const args: Schema = {
  type: "object",
  properties: {
    input: { type: "string", description: "Spec file path or URL" },
    out: {
      type: "string",
      description: "Output HTML path (stdout if omitted)",
    },
    theme: {
      type: "string",
      description: "Scalar theme",
      enum: themes,
    },
    from: {
      type: "string",
      description: "Source format (auto-detected if omitted)",
    },
  },
  required: ["input"],
};

export const docsCommand: CommandSpec<Input, void> = {
  path: ["docs"],
  description:
    "Render any spec as standalone HTML docs via Scalar (converts to OpenAPI 3 first)",
  args,
  handler: async (input) => {
    const { html } = await renderDocs({
      input: input.input,
      from: input.from as Parameters<typeof renderDocs>[0]["from"],
      theme: input.theme as Parameters<typeof renderDocs>[0]["theme"],
    });
    if (input.out) {
      await writeFile(input.out, html);
      process.stdout.write(`Wrote ${input.out}\n`);
    } else {
      process.stdout.write(html);
    }
  },
};
