import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { generate } from "../src/index.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const SPEC = resolve(here, "../../../../fixtures/petstore.yaml");

describe("@ir-kit/k6-gen output syntax", () => {
  it("every generated file parses as TypeScript", async () => {
    const dir = await mkdtemp(join(tmpdir(), "k6-gen-syntax-"));
    const result = await generate({
      input: SPEC,
      output: dir,
      normalize: true,
      scaffold: true,
      dryRun: true,
    });
    const errors = result.files
      .filter((f) => f.path.endsWith(".ts"))
      .flatMap((f) =>
        (
          ts.transpileModule(f.content, {
            fileName: f.path,
            reportDiagnostics: true,
          }).diagnostics ?? []
        ).map(
          (d) =>
            `${f.path}: ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`,
        ),
      );
    expect(errors).toEqual([]);
    await rm(dir, { recursive: true, force: true });
  }, 30_000);

  it("keeps multi-line summaries inside the stub header comment", async () => {
    const dir = await mkdtemp(join(tmpdir(), "k6-gen-summary-"));
    const spec = join(dir, "spec.yaml");
    await writeFile(
      spec,
      [
        "openapi: 3.1.0",
        "info: { title: t, version: '1' }",
        "paths:",
        "  /queue:",
        "    post:",
        "      operationId: addToQueue",
        "      summary: |",
        "        Add Item to",
        "        Playback Queue",
        "      responses: { '204': { description: ok } }",
      ].join("\n"),
    );
    const result = await generate({
      input: spec,
      output: join(dir, "out"),
      scaffold: true,
      dryRun: true,
    });
    const stub = result.files.find((f) => f.path === "loadtests/addToQueue.ts");
    expect(stub?.content).toContain(
      "// Stub loadtest for `addToQueue` — Add Item to Playback Queue.",
    );
    await rm(dir, { recursive: true, force: true });
  });
});
