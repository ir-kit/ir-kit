import { describe, expect, it } from "vitest";

import { resolveOpenAPIInput } from "../src/index.ts";

describe("resolveOpenAPIInput", () => {
  it("passes https URLs through verbatim", () => {
    expect(
      resolveOpenAPIInput("https://api.example.com/openapi.yaml", "/proj"),
    ).toBe("https://api.example.com/openapi.yaml");
  });

  it("passes http URLs through verbatim", () => {
    expect(
      resolveOpenAPIInput("http://localhost:8080/spec.json", "/proj"),
    ).toBe("http://localhost:8080/spec.json");
  });

  it("passes absolute paths through verbatim", () => {
    expect(resolveOpenAPIInput("/abs/path/spec.yaml", "/proj")).toBe(
      "/abs/path/spec.yaml",
    );
  });

  it("resolves relative paths against cwd", () => {
    expect(resolveOpenAPIInput("./openapi.yaml", "/proj")).toBe(
      "/proj/openapi.yaml",
    );
  });

  it("trims whitespace before deciding", () => {
    expect(
      resolveOpenAPIInput("   https://api.example.com/spec.yaml   ", "/proj"),
    ).toBe("https://api.example.com/spec.yaml");
  });

  it("returns pre-parsed objects unchanged", () => {
    const spec = { openapi: "3.1.0", info: { title: "t", version: "1" } };
    expect(resolveOpenAPIInput(spec, "/proj")).toBe(spec);
  });

  it("throws on empty input instead of resolving to cwd", () => {
    expect(() => resolveOpenAPIInput("", "/proj")).toThrow(
      /empty or only whitespace/,
    );
    expect(() => resolveOpenAPIInput("   ", "/proj")).toThrow(
      /empty or only whitespace/,
    );
  });
});
