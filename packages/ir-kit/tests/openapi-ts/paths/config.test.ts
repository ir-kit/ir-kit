import { describe, expect, it } from "vitest";

import { defineConfig as define } from "../../../src/openapi-ts/paths/config";
import type { Config } from "../../../src/openapi-ts/paths/types";

const defineConfig = (config?: Parameters<typeof define>[0]) =>
  define(config) as unknown as Omit<ReturnType<typeof define>, "config"> & {
    config: Config;
  };

describe("defineConfig", () => {
  it("keeps the default casing when only the suffix is overridden", () => {
    expect(defineConfig({ naming: { suffix: "Path" } }).config.naming).toEqual({
      casing: "camelCase",
      suffix: "Path",
    });
  });

  it("uses defaults without user config", () => {
    expect(defineConfig().config).toMatchObject({
      naming: { casing: "camelCase", suffix: "Route" },
      output: "paths",
    });
  });

  it("accepts an explicit casing", () => {
    expect(
      defineConfig({ naming: { casing: "PascalCase" } }).config.naming.casing,
    ).toBe("PascalCase");
  });
});
