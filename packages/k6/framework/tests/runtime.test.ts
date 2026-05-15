import { afterEach, describe, expect, it } from "vitest";

import { buildQuery, mergeTags, parseJson } from "../src/client-runtime.ts";
import { getBaseUrl, setBaseUrl } from "../src/runtime.ts";

describe("client-runtime helpers", () => {
  it("buildQuery — skips null/undefined and url-encodes keys + values", () => {
    expect(buildQuery({ a: 1, b: null, c: undefined, d: "x y" })).toBe(
      "?a=1&d=x%20y",
    );
  });

  it("buildQuery — repeats array values", () => {
    expect(buildQuery({ tag: ["a", "b"] })).toBe("?tag=a&tag=b");
  });

  it("parseJson — returns undefined for empty body", () => {
    expect(parseJson({ body: "" })).toBeUndefined();
    expect(parseJson({ body: null })).toBeUndefined();
  });

  it("parseJson — round-trips JSON", () => {
    expect(parseJson({ body: '{"a":1}' })).toEqual({ a: 1 });
  });

  it("mergeTags — always stamps `operation`", () => {
    expect(mergeTags("addPet", undefined)).toEqual({ operation: "addPet" });
    expect(mergeTags("addPet", { foo: "bar" })).toEqual({
      operation: "addPet",
      foo: "bar",
    });
  });
});

describe("getBaseUrl / setBaseUrl", () => {
  afterEach(() => setBaseUrl(undefined));

  it("returns the fallback when nothing is set", () => {
    expect(getBaseUrl("https://default")).toBe("https://default");
  });

  it("preferences the runtime override over the fallback", () => {
    setBaseUrl("https://override");
    expect(getBaseUrl("https://default")).toBe("https://override");
  });
});
