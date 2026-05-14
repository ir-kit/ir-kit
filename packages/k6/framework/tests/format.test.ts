import { describe, expect, it } from "vitest";

import { parseDurationMs, parsePercentRate } from "../src/format.ts";

describe("parseDurationMs", () => {
  it("parses ms / s / m / h units", () => {
    expect(parseDurationMs("500ms")).toBe(500);
    expect(parseDurationMs("2s")).toBe(2_000);
    expect(parseDurationMs("1m")).toBe(60_000);
    expect(parseDurationMs("1h")).toBe(3_600_000);
  });

  it("parses fractional values", () => {
    expect(parseDurationMs("1.5s")).toBe(1_500);
  });

  it("throws on garbage", () => {
    expect(() => parseDurationMs("forever")).toThrow(/invalid duration/i);
    expect(() => parseDurationMs("")).toThrow(/invalid duration/i);
  });
});

describe("parsePercentRate", () => {
  it("converts to a 0..1 rate", () => {
    expect(parsePercentRate("1%")).toBeCloseTo(0.01);
    expect(parsePercentRate("0.5%")).toBeCloseTo(0.005);
    expect(parsePercentRate("100%")).toBeCloseTo(1);
  });

  it("throws on garbage", () => {
    expect(() => parsePercentRate("ten")).toThrow(/invalid percent/i);
  });
});
