import { go } from "@ir-kit/compiler-go";

/** Package identifier → import path for every package generated code
 *  references. Parameters can never shadow these (see `paramIdent`), so
 *  an identifier used as a selector base is always the package. */
const PACKAGES: Readonly<Record<string, string>> = {
  bytes: "bytes",
  context: "context",
  errors: "errors",
  fmt: "fmt",
  http: "net/http",
  io: "io",
  json: "encoding/json",
  path: "path",
  strconv: "strconv",
  strings: "strings",
  time: "time",
  url: "net/url",
};

/** Import paths referenced by a lowered AST: selector bases
 *  (`fmt.Sprint`) and qualified type names (`context.Context`). */
export function collectImports(nodes: ReadonlyArray<unknown>): string[] {
  const found = new Set<string>();
  const visit = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const n of node) visit(n);
      return;
    }
    const n = node as { kind?: unknown; name?: unknown; object?: unknown };
    if (n.kind === go.GoNodeKind.Identifier && typeof n.name === "string") {
      const dot = n.name.indexOf(".");
      if (dot > 0) addPackage(n.name.slice(0, dot));
    }
    if (n.kind === go.GoNodeKind.MemberExpression) {
      const obj = n.object as { kind?: unknown; name?: unknown };
      if (
        obj?.kind === go.GoNodeKind.Identifier &&
        typeof obj.name === "string"
      )
        addPackage(obj.name);
    }
    for (const v of Object.values(node)) visit(v);
  };
  const addPackage = (pkg: string) => {
    const path = PACKAGES[pkg];
    if (path) found.add(path);
  };
  visit(nodes);
  return [...found].sort();
}
