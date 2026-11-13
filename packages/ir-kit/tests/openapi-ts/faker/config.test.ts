import { describe, expect, it } from "vitest";

import {
  DEFAULT_FORMAT_MAPPING,
  defineConfig,
} from "../../../src/openapi-ts/faker/config";

describe("defineConfig", () => {
  it("merges user format mappings over the defaults", () => {
    const { formatMapping } = defineConfig({
      formatMapping: { email: "internet.exampleEmail" },
    }).config;

    expect(formatMapping).toEqual({
      ...DEFAULT_FORMAT_MAPPING,
      email: "internet.exampleEmail",
    });
  });

  it("uses default format mappings without user config", () => {
    expect(defineConfig().config.formatMapping).toEqual(DEFAULT_FORMAT_MAPPING);
  });

  it("keeps scalar defaults when other options are set", () => {
    expect(defineConfig({ defaultBatchCount: 3 }).config).toMatchObject({
      defaultBatchCount: 3,
      generateBatchCreators: true,
      output: "factories.gen",
      respectConstraints: true,
    });
  });
});
