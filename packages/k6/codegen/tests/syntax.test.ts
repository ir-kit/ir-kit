import { mkdtemp, rm } from "node:fs/promises";
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
  });
});
