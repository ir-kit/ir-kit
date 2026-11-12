import { describe, expect, it } from "vitest";

import { defineConfig } from "../src/config";

describe("defineConfig", () => {
  it("resolves request and response naming defaults", () => {
    const { config } = defineConfig();

    expect(config.requests).toEqual({
      case: "camelCase",
      enabled: true,
      jsonName: "t{{name}}DataJsonSchema",
      name: "t{{name}}Data",
    });
    expect(config.responses).toEqual({
      case: "camelCase",
      enabled: true,
      jsonName: "t{{name}}ResponseJsonSchema",
      name: "t{{name}}Response",
    });
  });

  it("cascades the top-level case into requests and responses", () => {
    const { config } = defineConfig({ case: "PascalCase" });

    expect(config.requests.case).toBe("PascalCase");
    expect(config.responses.case).toBe("PascalCase");
  });

  it("accepts shorthand values", () => {
    const { config } = defineConfig({
      requests: false,
      responses: "validate{{name}}",
    });

    expect(config.requests.enabled).toBe(false);
    expect(config.responses).toMatchObject({
      enabled: true,
      jsonName: "t{{name}}ResponseJsonSchema",
      name: "validate{{name}}",
    });
  });

  it("merges partial objects with defaults", () => {
    const { config } = defineConfig({ requests: { jsonName: "j{{name}}" } });

    expect(config.requests).toEqual({
      case: "camelCase",
      enabled: true,
      jsonName: "j{{name}}",
      name: "t{{name}}Data",
    });
  });
});
