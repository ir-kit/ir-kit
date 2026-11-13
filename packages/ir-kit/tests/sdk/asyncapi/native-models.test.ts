import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadOpenAPIForSdk } from "../../../src/generate/load-openapi.js";
import { generate } from "../../../src/sdk/go/index.js";

const SPEC = resolve(__dirname, "../../../../../fixtures/user-events.yaml");

describe("AsyncAPI input for the native SDK targets", () => {
  let out: string | undefined;
  afterEach(async () => {
    if (out) await rm(out, { recursive: true, force: true });
  });

  it("loads message payloads as component schemas with no paths", async () => {
    const doc = await loadOpenAPIForSdk(SPEC);
    expect(doc.paths).toEqual({});
    const schemas = (doc.components as { schemas: Record<string, unknown> })
      .schemas;
    expect(Object.keys(schemas)).toEqual(
      expect.arrayContaining([
        "UserAccountCreatedMessage",
        "UserAccountDeletedMessage",
      ]),
    );
  }, 30_000);

  it("writes a Go model per message", async () => {
    out = await mkdtemp(join(tmpdir(), "ir-asyncapi-go-"));
    await generate({ input: await loadOpenAPIForSdk(SPEC), output: out });
    const models = await readFile(join(out, "models.go"), "utf8");
    expect(models).toContain("type UserAccountCreatedMessage struct");
    expect(models).toContain("type UserAccountDeletedMessage struct");
  }, 30_000);
});
