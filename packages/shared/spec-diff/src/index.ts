import type {
  ConvertSpecInput,
  SpecDocument,
  SpecFormat,
} from "@ir-kit/spec-convert";

import { convertSpec } from "@ir-kit/spec-convert";
import { compareOpenApi, type Diff } from "api-smart-diff";

export type { Diff };

export type DiffType =
  | "breaking"
  | "non-breaking"
  | "annotation"
  | "unclassified"
  | "deprecated";

export interface DiffSummary {
  total: number;
  breaking: number;
  nonBreaking: number;
  annotation: number;
  unclassified: number;
  deprecated: number;
}

export interface DiffSpecsOptions {
  before: ConvertSpecInput;
  after: ConvertSpecInput;
  fromBefore?: SpecFormat;
  fromAfter?: SpecFormat;
  cwd?: string;
}

export interface DiffSpecsResult {
  diffs: Diff[];
  summary: DiffSummary;
  before: { from: SpecFormat; openapi: SpecDocument };
  after: { from: SpecFormat; openapi: SpecDocument };
}

/**
 * Cross-family API spec diff. Converts both inputs to OpenAPI 3 via
 * `@ir-kit/spec-convert`, then runs `api-smart-diff`'s `compareOpenApi`.
 * Returns the raw diff list plus a breaking/non-breaking summary.
 */
export async function diffSpecs(
  opts: DiffSpecsOptions,
): Promise<DiffSpecsResult> {
  const [before, after] = await Promise.all([
    normalizeToOpenApi(opts.before, opts.fromBefore, opts.cwd),
    normalizeToOpenApi(opts.after, opts.fromAfter, opts.cwd),
  ]);

  const { diffs } = compareOpenApi(before.openapi, after.openapi);

  return {
    diffs,
    summary: summarize(diffs),
    before,
    after,
  };
}

async function normalizeToOpenApi(
  input: ConvertSpecInput,
  from: SpecFormat | undefined,
  cwd: string | undefined,
): Promise<{ from: SpecFormat; openapi: SpecDocument }> {
  const result = await convertSpec({ input, from, to: "openapi3", cwd });
  if (result.output.kind !== "document") {
    throw new Error(
      `Unexpected converter output kind '${result.output.kind}' for openapi3 target`,
    );
  }
  return { from: result.from, openapi: result.output.document };
}

function summarize(diffs: Diff[]): DiffSummary {
  const summary: DiffSummary = {
    total: diffs.length,
    breaking: 0,
    nonBreaking: 0,
    annotation: 0,
    unclassified: 0,
    deprecated: 0,
  };
  for (const diff of diffs) {
    switch (diff.type) {
      case "breaking":
        summary.breaking++;
        break;
      case "non-breaking":
        summary.nonBreaking++;
        break;
      case "annotation":
        summary.annotation++;
        break;
      case "unclassified":
        summary.unclassified++;
        break;
      case "deprecated":
        summary.deprecated++;
        break;
    }
  }
  return summary;
}
