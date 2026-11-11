import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { safeIdent } from "../src/identifiers.ts";
import { Namespace } from "../src/namespace.ts";

describe("Namespace", () => {
  const goTypes = () => new Namespace({ normalize: safeIdent });

  it("normalizes on claim and is idempotent per key", () => {
    const ns = goTypes();
    assert.equal(
      ns.claim("schema:properties-store", "properties-store"),
      "PropertiesStore",
    );
    assert.equal(
      ns.claim("schema:properties-store", "whatever"),
      "PropertiesStore",
    );
    assert.equal(ns.get("schema:properties-store"), "PropertiesStore");
  });

  it("disambiguates distinct keys that normalize to the same name", () => {
    const ns = goTypes();
    assert.equal(ns.claim("schema:Pet", "Pet"), "Pet");
    assert.equal(ns.claim("schema:pet", "pet"), "Pet2");
    assert.equal(ns.claim("synth:X/pet", "Pet"), "Pet3");
  });

  it("never hands out reserved names", () => {
    const ns = new Namespace({
      normalize: safeIdent,
      reserved: new Set(["Client"]),
      disambiguate: (b, n) => `${b}_${n}`,
    });
    assert.equal(ns.claim("schema:client", "client"), "Client_2");
  });

  it("folds case when asked", () => {
    const ns = new Namespace({ normalize: (s) => s, foldCase: true });
    assert.equal(ns.claim("a", "Foo"), "Foo");
    assert.equal(ns.claim("b", "foo"), "foo2");
  });
});
