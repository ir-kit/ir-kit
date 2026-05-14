import { describe, expect, it } from "vitest";

import { renderConfig, renderLoadtest } from "../src/scaffold/loadtest.tpl.ts";

describe("renderLoadtest", () => {
  it("scaffolds bearer auth when requested", () => {
    const out = renderLoadtest({
      clientPath: "./src/gen/index.js",
      auth: "bearer",
      authEnv: "MY_TOKEN",
    });
    expect(out).toMatch(/useAuth/);
    expect(out).toMatch(/useAuth\.bearer\(\{ env: "MY_TOKEN" \}\)/);
    expect(out).toMatch(/use: \[auth\]/);
  });

  it("omits auth when none", () => {
    const out = renderLoadtest({
      clientPath: "./src/gen/index.js",
      auth: "none",
    });
    expect(out).not.toMatch(/useAuth/);
    expect(out).not.toMatch(/use: \[auth\]/);
  });
});

describe("renderConfig", () => {
  it("wraps the spec + output paths as a defineConfig call", () => {
    const out = renderConfig("./openapi.yaml", "./src/gen");
    expect(out).toMatch(
      /import \{ defineConfig \} from "@ahmedrowaihi\/k6-tools"/,
    );
    expect(out).toMatch(/spec: "\.\/openapi\.yaml"/);
    expect(out).toMatch(/output: "\.\/src\/gen"/);
  });
});
