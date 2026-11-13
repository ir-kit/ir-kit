import type { IR } from "../../../src/ir/index.js";
import { parseSpec } from "../../../src/openapi-tools/parse.js";

type Fragment = {
  components?: Record<string, unknown>;
  paths?: Record<string, unknown>;
};

export function ir(
  fragment: Fragment,
  version: "3.0" | "3.1" = "3.1",
): IR.Model {
  return parseSpec({
    openapi: version === "3.0" ? "3.0.4" : "3.1.0",
    info: { title: "test", version: "0" },
    paths: {},
    ...fragment,
  });
}

/**
 * Extract per-op security-scheme names from a raw spec fragment, keyed
 * the same way `operationsToDecls` expects (`${path}|${method}`). The IR
 * drops scheme names from `op.security`, so tests building from a
 * fragment with security need to thread this through explicitly.
 */
