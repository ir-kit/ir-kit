import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { classifySpecDocument, loadSpec } from "../src/index.js";

let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "spec-loader-"));
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

const write = async (name: string, content: string) => {
  const path = join(dir, name);
  await writeFile(path, content);
  return path;
};

describe("classifySpecDocument", () => {
  it("reads the root version field", () => {
    expect(classifySpecDocument({ openapi: "3.1.0" })).toBe("openapi");
    expect(classifySpecDocument({ swagger: "2.0" })).toBe("openapi");
    expect(classifySpecDocument({ asyncapi: "3.0.0" })).toBe("asyncapi");
    expect(classifySpecDocument({ name: "pkg" })).toBeUndefined();
  });
});

describe("loadSpec", () => {
  it("detects AsyncAPI whose version key is not near the top", async () => {
    const description = "x".repeat(4096);
    const path = await write(
      "late.yaml",
      `info:\n  title: Late\n  version: "1"\n  description: ${description}\nasyncapi: 3.0.0\n`,
    );
    const result = await loadSpec({ input: path });
    expect(result.kind).toBe("asyncapi");
    // why: the first AsyncAPI parse cold-loads the parser and its schemas.
  }, 30_000);

  it("rejects files that are not API specs", async () => {
    const path = await write("package.json", '{ "name": "pkg" }');
    await expect(loadSpec({ input: path })).rejects.toThrow(
      /Unrecognized spec .*package\.json/,
    );
  });

  it("rejects objects that are not API specs", async () => {
    await expect(loadSpec({ input: { name: "pkg" } })).rejects.toThrow(
      "Unrecognized spec",
    );
  });
});
