import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { sdkAllCommand } from "../src/commands/sdk-all.js";
import {
  sdkGoCommand,
  sdkJavaCommand,
  sdkKotlinCommand,
  sdkSwiftCommand,
} from "../src/commands/sdk-native.js";

const fixture = join(
  import.meta.dirname,
  "../../openapi/typespec-loader/tests/fixtures/jsonschema-demo.tsp",
);

const listFiles = async (dir: string): Promise<string[]> =>
  (await readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

describe("sdk commands", () => {
  let out: string | undefined;
  afterEach(async () => {
    if (out) await rm(out, { recursive: true, force: true });
  });

  it("sdk all generates native targets from a TypeSpec input", async () => {
    out = await mkdtemp(join(tmpdir(), "ir-sdk-all-"));
    await sdkAllCommand.handler({
      input: fixture,
      output: out,
      targets: "go,java",
    });
    expect(await readdir(out)).toEqual(["go", "java"]);
    expect(
      (await listFiles(join(out, "go"))).some((f) => f.endsWith(".go")),
    ).toBe(true);
    expect(
      (await listFiles(join(out, "java"))).some((f) => f.endsWith(".java")),
    ).toBe(true);
  });

  it("sdk all rejects unknown targets", async () => {
    await expect(
      sdkAllCommand.handler({
        input: fixture,
        output: "unused",
        targets: "go,cobol",
      }),
    ).rejects.toThrow("Unknown target: cobol");
  });

  it("sdk java emits Gradle files when asked", async () => {
    out = await mkdtemp(join(tmpdir(), "ir-sdk-java-"));
    await sdkJavaCommand.handler({
      input: fixture,
      output: out,
      gradle: true,
      packageName: "com.acme.api",
    });
    const files = await readdir(out);
    expect(files).toContain("build.gradle.kts");
    expect(files).toContain("settings.gradle.kts");
    expect(
      await readdir(join(out, "src/main/java/com/acme/api")),
    ).not.toHaveLength(0);
  });

  it.each([
    ["go", sdkGoCommand, { gomod: "example.com/acme" }, "go.mod"],
    ["kotlin", sdkKotlinCommand, { gradle: true }, "build.gradle.kts"],
    ["swift", sdkSwiftCommand, { swiftPackage: true }, "Package.swift"],
  ] as const)("sdk %s passes its project flag through", async (_, command, flags, file) => {
    out = await mkdtemp(join(tmpdir(), "ir-sdk-native-"));
    await command.handler({ input: fixture, output: out, ...flags });
    expect(await readdir(out)).toContain(file);
  });
});
