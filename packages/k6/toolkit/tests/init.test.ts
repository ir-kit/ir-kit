import { describe, expect, it } from "vitest";

import { scaffoldLoadtest } from "../src/loadtest-scaffold.ts";

describe("scaffoldLoadtest", () => {
  it("emits the no-auth shape — no useAuth import, no `use:` field", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
    });

    expect(out).toMatch(
      /import \{ defineLoadTest, flow, smoke \} from "@ahmedrowaihi\/k6"/,
    );
    expect(out).toContain('import * as api from "./src/gen/index.js"');
    expect(out).not.toMatch(/useAuth/);
    expect(out).not.toMatch(/^\s*use:/m);
  });

  it("emits the bearer shape — useAuth import + auth decl + use:[auth]", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "bearer",
      bearerEnv: "PETSTORE_TOKEN",
    });

    expect(out).toMatch(
      /import \{ defineLoadTest, flow, smoke, useAuth \} from "@ahmedrowaihi\/k6"/,
    );
    expect(out).toMatch(
      /const auth = useAuth\.bearer\(\{ env: "PETSTORE_TOKEN" \}\);/,
    );
    expect(out).toMatch(/use:\s*\[auth\]/);
  });

  it("threads pace + duration into smoke() call", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
      pace: "smoke",
      duration: "2m",
    });
    expect(out).toMatch(/pace:\s*smoke\(\{\s*duration:\s*"2m"\s*\}\)/);
  });

  it("imports the selected pace helper (not just `smoke`) when `pace` is set", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
      pace: "stress",
      duration: "1m",
    });
    expect(out).toMatch(
      /import \{ defineLoadTest, flow, stress \} from "@ahmedrowaihi\/k6"/,
    );
    expect(out).toMatch(/pace:\s*stress\(/);
  });

  it("emits valid runnable shape — re-exports options + default", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
    });
    expect(out).toMatch(/export const options = lt\.options;/);
    expect(out).toMatch(/export default lt\.default;/);
  });

  it("emits the basic-auth shape", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "basic",
    });
    expect(out).toMatch(/useAuth\.basic\(/);
    expect(out).toMatch(/env:\s*"API_USER"/);
    expect(out).toMatch(/env:\s*"API_PASS"/);
  });

  it("emits the apiKey shape with custom header + env", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "apiKey",
      apiKeyHeader: "X-Petstore-Key",
      apiKeyEnv: "PETSTORE_KEY",
    });
    expect(out).toMatch(/useAuth\.apiKey\(/);
    expect(out).toMatch(/name:\s*"X-Petstore-Key"/);
    expect(out).toMatch(/env:\s*"PETSTORE_KEY"/);
  });

  it("emits the session shape with a signIn arrow function", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "session",
    });
    expect(out).toMatch(/useAuth\.session\(/);
    expect(out).toMatch(/signIn:\s*\(\)\s*=>/);
  });

  it("uses the named-scenarios shape when `scenarios` is non-empty", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
      scenarios: ["browse", "write"],
    });
    expect(out).toMatch(/defineLoadTest\(\{\s*scenarios:\s*\{/);
    expect(out).toMatch(/browse:\s*\{/);
    expect(out).toMatch(/write:\s*\{/);
  });

  it("seeds the flow step with `api.<seedOperation>()` when set", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
      seedOperation: "listPets",
    });
    expect(out).toMatch(/\.step\("listPets",\s*\(\)\s*=>\s*\{/);
    expect(out).toMatch(/api\.listPets\(\)/);
  });

  it("falls back to the empty `health` placeholder when no seed op is given", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
    });
    expect(out).toMatch(/\.step\("health",\s*\(\)\s*=>\s*\{\s*\}\)/);
  });
});
