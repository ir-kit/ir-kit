import { describe, expect, it } from "vitest";

import { defineConfig as define } from "../../../src/openapi-ts/orpc/config";
import type { Config } from "../../../src/openapi-ts/orpc/types";

const defineConfig = (config?: Parameters<typeof define>[0]) =>
  define(config) as unknown as Omit<ReturnType<typeof define>, "config"> & {
    config: Config;
  };

describe("defineConfig", () => {
  it("fills nested defaults when the user passes a partial server config", () => {
    const { config } = defineConfig({
      server: { implementation: true, handlers: { mode: "faker" } },
    });

    expect(config.server).toEqual({
      implementation: true,
      handlers: {
        dir: "src/handlers",
        faker: undefined,
        implementer: undefined,
        importAlias: undefined,
        mode: "faker",
        override: false,
        proxy: undefined,
      },
    });
  });

  it("enables stub handlers when only implementation is set", () => {
    const { config } = defineConfig({ server: { implementation: true } });

    expect(config.server.handlers).toEqual({
      dir: "src/handlers",
      mode: "stub",
      override: false,
    });
  });

  it("disables handlers by default", () => {
    expect(defineConfig().config.server).toEqual({
      implementation: false,
      handlers: false,
    });
  });

  it("expands a validator string to both directions and depends on it", () => {
    const plugin = defineConfig({ validator: "valibot" });

    expect(plugin.config.validator).toMatchObject({
      input: "valibot",
      output: "valibot",
    });
    expect(plugin.dependencies).toContain("valibot");
  });

  it("defaults validators to zod and disables them with false", () => {
    expect(defineConfig().config.validator).toMatchObject({
      input: "zod",
      output: "zod",
    });
    const disabled = defineConfig({ validator: false });
    expect(disabled.config.validator).toMatchObject({
      input: false,
      output: false,
    });
    expect(disabled.dependencies).not.toContain("zod");
  });

  it("keeps per-direction validators", () => {
    const plugin = defineConfig({ validator: { output: false } });

    expect(plugin.config.validator).toMatchObject({
      input: "zod",
      output: false,
    });
  });

  it("keeps client defaults for keys the user omits", () => {
    expect(defineConfig({ client: { rpc: true } }).config.client).toEqual({
      messageport: false,
      openapi: false,
      rpc: true,
      tanstack: false,
      websocket: false,
    });
  });

  it("resolves naming rules", () => {
    const { naming } = defineConfig({
      naming: { operation: { casing: "snake_case" } },
    }).config;

    expect(naming.contract).toEqual({ casing: "PascalCase" });
    expect(naming.operation.casing).toBe("snake_case");
  });
});
