import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@hey-api/openapi-ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { defineConfig } from "../src/config";

const here = dirname(fileURLToPath(import.meta.url));
const SPEC = resolve(here, "../../../../../fixtures/petstore.yaml");

describe("generate", () => {
  let outDir: string;

  beforeAll(async () => {
    outDir = await mkdtemp(join(tmpdir(), "ir-kit-orpc-"));
    await createClient({
      input: SPEC,
      logs: { level: "silent" },
      output: { path: outDir },
      plugins: [
        "@hey-api/typescript",
        "zod",
        defineConfig({
          client: { messageport: true, rpc: true, websocket: true },
          validator: "zod",
        }),
      ],
    });
  }, 60_000);

  afterAll(async () => {
    await rm(outDir, { force: true, recursive: true });
  });

  const read = (file: string) =>
    readFile(join(outDir, "@ir-kit/orpc", file), "utf8");

  it("imports each transport's RPCLink under a distinct local name", async () => {
    const client = await read("client.gen.ts");

    expect(client).toMatch(
      /import \{ RPCLink(?: as (\w+))? \} from '@orpc\/client\/fetch'/,
    );
    expect(client).toMatch(
      /import \{ RPCLink as \w+ \} from '@orpc\/client\/websocket'/,
    );
    expect(client).toMatch(
      /import \{ RPCLink as \w+ \} from '@orpc\/client\/message-port'/,
    );
    expect(client).toContain("from '@orpc/client'");
  });

  it("builds contracts from the zod plugin's schemas", async () => {
    const contract = await read("pet/contract.gen.ts");

    expect(contract).toContain("import { oc } from '@orpc/contract'");
    expect(contract).toMatch(/from '\.\.\/\.\.\/\.\.\/zod\.gen'/);
  });
});
