import type { JDecl } from "../ast/index.js";
import { walk } from "../ast/index.js";

const PLATFORM: ReadonlyMap<string, string> = new Map(
  Object.entries({
    ArrayList: "java.util.ArrayList",
    List: "java.util.List",
    Map: "java.util.Map",
    OffsetDateTime: "java.time.OffsetDateTime",
    LocalDate: "java.time.LocalDate",
    HttpRequest: "java.net.http.HttpRequest",
    TypeReference: "com.fasterxml.jackson.core.type.TypeReference",
    JsonProperty: "com.fasterxml.jackson.annotation.JsonProperty",
    JsonValue: "com.fasterxml.jackson.annotation.JsonValue",
  }),
);

export const RUNTIME_TYPES: ReadonlySet<string> = new Set([
  "ApiClient",
  "ApiException",
  "ApiResult",
  "MultipartFormBody",
  "QueryStyle",
  "RequestOptions",
  "UrlEncoding",
]);

export function referencedNames(decl: JDecl): Set<string> {
  const names = new Set<string>();
  walk(decl.node, (node) => {
    if (node.kind === "Identifier") names.add(node.name);
  });
  return names;
}

/**
 * Imports for one file, from the simple names its AST mentions. `packageOf`
 * maps a generated declaration's name to the package it is placed in.
 */
export function importsFor(
  decl: JDecl,
  filePkg: string,
  runtimePkg: string,
  packageOf: ReadonlyMap<string, string>,
): string[] {
  const out = new Set<string>();
  for (const name of referencedNames(decl)) {
    if (name === decl.name) continue;
    const platform = PLATFORM.get(name);
    if (platform) out.add(platform);
    else if (RUNTIME_TYPES.has(name) && runtimePkg !== filePkg)
      out.add(`${runtimePkg}.${name}`);
    else {
      const pkg = packageOf.get(name);
      if (pkg && pkg !== filePkg) out.add(`${pkg}.${name}`);
    }
  }
  return [...out].sort();
}
