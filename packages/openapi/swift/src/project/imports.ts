import { swift } from "@ir-kit/compiler-swift";
import type { SwDecl } from "../ast/index.js";
import { someNode } from "../ast/walk.js";

const FOUNDATION = "Foundation";
const FOUNDATION_NETWORKING = "FoundationNetworking";

/** Types that live in `FoundationNetworking` outside Apple platforms. */
const NETWORKING_TYPES: ReadonlySet<string> = new Set([
  "HTTPURLResponse",
  "URLRequest",
  "URLResponse",
  "URLSession",
  "URLSessionConfiguration",
  "URLSessionTask",
]);

export interface SwImports {
  imports: string[];
  /** Modules imported under `#if canImport(<module>)`. */
  conditionalImports: string[];
}

/**
 * Within one SDK module every generated type is visible, so only
 * platform modules are imported: `Foundation` always, and
 * `FoundationNetworking` (Linux) when the decl names a networking type.
 */
export function collectImports(decl: SwDecl): SwImports {
  const networking = someNode(
    decl.node,
    (n) =>
      (n.kind === swift.SwiftNodeKind.IdentifierType &&
        NETWORKING_TYPES.has(n.name as string)) ||
      (n.kind === swift.SwiftNodeKind.Identifier &&
        NETWORKING_TYPES.has(n.baseName as string)),
  );
  return {
    imports: [FOUNDATION],
    conditionalImports: networking ? [FOUNDATION_NETWORKING] : [],
  };
}
