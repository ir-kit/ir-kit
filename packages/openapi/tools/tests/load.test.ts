import { describe, expect, it } from "vitest";

import { resolveSpecInput } from "../src/load.ts";

describe("resolveSpecInput", () => {
  it("passes https URLs through verbatim", () => {
    expect(
      resolveSpecInput("https://api.example.com/openapi.yaml", "/proj"),
    ).toBe("https://api.example.com/openapi.yaml");
  });

  it("passes http URLs through verbatim", () => {
    expect(resolveSpecInput("http://localhost:8080/spec.json", "/proj")).toBe(
      "http://localhost:8080/spec.json",
    );
  });

  it("passes absolute paths through verbatim", () => {
    expect(resolveSpecInput("/abs/path/spec.yaml", "/proj")).toBe(
      "/abs/path/spec.yaml",
    );
  });

  it("resolves relative paths against cwd", () => {
    expect(resolveSpecInput("./openapi.yaml", "/proj")).toBe(
      "/proj/openapi.yaml",
    );
  });

  it("trims whitespace before deciding", () => {
    expect(
      resolveSpecInput("   https://api.example.com/spec.yaml   ", "/proj"),
    ).toBe("https://api.example.com/spec.yaml");
  });

  it("returns pre-parsed objects unchanged", () => {
    const spec = { openapi: "3.1.0", info: { title: "t", version: "1" } };
    expect(resolveSpecInput(spec, "/proj")).toBe(spec);
  });
});
