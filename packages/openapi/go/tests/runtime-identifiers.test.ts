import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  buildRuntimeFiles,
  GO_RUNTIME_IDENTIFIERS,
} from "../src/ir/runtime/index.ts";

function declaredIdentifiers(source: string): string[] {
  const out: string[] = [];
  let inBlock = false;
  for (const line of source.split("\n")) {
    if (/^(const|var) \($/.test(line)) inBlock = true;
    else if (inBlock && line === ")") inBlock = false;
    else if (inBlock) {
      const m = /^\t([A-Z]\w*)/.exec(line);
      if (m) out.push(m[1]!);
    } else {
      const m = /^(?:type|func|var|const) ([A-Z]\w*)/.exec(line);
      if (m) out.push(m[1]!);
    }
  }
  return out;
}

describe("GO_RUNTIME_IDENTIFIERS", () => {
  it("lists every exported package-scope identifier the runtime declares", () => {
    const files = buildRuntimeFiles({ hasMultipart: true }, "api");
    const missing = files
      .flatMap((f) => declaredIdentifiers(f.content))
      .filter((id) => !GO_RUNTIME_IDENTIFIERS.has(id));
    assert.deepEqual([...new Set(missing)], []);
  });
});
