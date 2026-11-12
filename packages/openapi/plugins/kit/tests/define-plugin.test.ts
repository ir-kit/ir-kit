import { coerce } from "@hey-api/shared";
import { describe, expect, it } from "vitest";

import { definePlugin } from "../src/index.js";

const defineConfig = definePlugin({
  config: {
    naming: {
      casing: coerce((value?: string) => value?.toLowerCase() ?? "camelcase"),
      suffix: "Route",
    },
  },
  handler: () => {},
  name: "test-plugin",
} as never);

describe("definePlugin", () => {
  it("keeps nested defaults the user leaves out", () => {
    expect(
      defineConfig({ naming: { suffix: "Path" } } as never).config as never,
    ).toEqual({ naming: { casing: "camelcase", suffix: "Path" } });
  });

  it("runs coercers on nested user values", () => {
    expect(
      defineConfig({ naming: { casing: "PascalCase" } } as never)
        .config as never,
    ).toEqual({ naming: { casing: "pascalcase", suffix: "Route" } });
  });

  it("uses the defaults without user config", () => {
    expect(defineConfig().config as never).toEqual({
      naming: { casing: "camelcase", suffix: "Route" },
    });
  });
});
