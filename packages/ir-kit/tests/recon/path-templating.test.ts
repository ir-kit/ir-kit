import { describe, expect, it } from "vitest";

import { templatePathFor } from "../../src/recon/infer/path.js";

const template = (path: string, peers: string[] = [path]) =>
  templatePathFor(path, peers).template;

describe("templatePathFor", () => {
  it("templates strong ids from a single observation", () => {
    expect(template("/users/42")).toBe("/users/{userId}");
    expect(template("/users/3f2a9c1e-1111-4222-8333-444455556666/posts")).toBe(
      "/users/{userId}/posts",
    );
    expect(template("/events/018f3b6e-7c4a-7d2e-b1f0-0a1b2c3d4e5f")).toBe(
      "/events/{eventId}",
    );
    expect(template("/objects/507f1f77bcf86cd799439011")).toBe(
      "/objects/{objectId}",
    );
  });

  it("keeps static segments next to templated siblings", () => {
    const peers = ["/users/1", "/users/2", "/users/me"];
    expect(template("/users/1", peers)).toBe("/users/{userId}");
    expect(template("/users/me", peers)).toBe("/users/me");
  });

  it("does not let an unrelated path block templating", () => {
    const peers = ["/users/1", "/orgs/acme", "/users/2"];
    expect(template("/users/2", peers)).toBe("/users/{userId}");
    expect(template("/orgs/acme", peers)).toBe("/orgs/acme");
  });

  it("templates weak id-like slugs only when peers vary", () => {
    expect(template("/v1/items")).toBe("/v1/items");
    expect(template("/items/item-12ab")).toBe("/items/item-12ab");
    const peers = ["/items/item-12ab", "/items/item-99zz"];
    expect(template("/items/item-12ab", peers)).toBe("/items/{itemId}");
  });

  it("types parameters from every observed value", () => {
    const peers = ["/users/1", "/users/abc-2"];
    expect(templatePathFor("/users/1", peers).paramTypes).toEqual({
      userId: "string",
    });
    const hexPeers = ["/objects/deadbeefdeadbeef", "/objects/1"];
    for (const path of hexPeers) {
      expect(templatePathFor(path, hexPeers).paramTypes).toEqual({
        objectId: "string",
      });
    }
    expect(templatePathFor("/users/7", ["/users/7"]).paramTypes).toEqual({
      userId: "integer",
    });
  });

  it("names nested parameters after their collection", () => {
    expect(template("/users/1/posts/2")).toBe("/users/{userId}/posts/{postId}");
  });
});
