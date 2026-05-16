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

  it("emits valid runnable shape — re-exports options + default", () => {
    const out = scaffoldLoadtest({
      clientImportPath: "./src/gen/index.js",
      auth: "none",
    });
    expect(out).toMatch(/export const options = lt\.options;/);
    expect(out).toMatch(/export default lt\.default;/);
  });
});
