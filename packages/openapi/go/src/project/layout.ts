import { posix as pathPosix } from "node:path";
import type { GoDecl } from "../go-dsl/decl/types.js";

export interface PlacementOptions {
  /** Per-decl override; `undefined` falls back to the default
   *  filename derived from the decl's name. */
  fileLocation?: (decl: GoDecl) => { dir?: string; file?: string } | undefined;
}

export interface PlacedDecl {
  decl: GoDecl;
  dir: string;
  fileName: string;
}

export function placeDecl(decl: GoDecl, opts: PlacementOptions): PlacedDecl {
  const override = opts.fileLocation?.(decl);
  if (override?.dir) safeRelativeDir(override.dir);
  return {
    decl,
    dir: override?.dir ?? ".",
    fileName: override?.file ?? declFileName(decl),
  };
}

function safeRelativeDir(dir: string): string {
  const normalized = pathPosix.normalize(dir || ".");
  if (
    pathPosix.isAbsolute(normalized) ||
    normalized === ".." ||
    normalized.startsWith("../")
  ) {
    throw new Error(`fileLocation: invalid output directory: ${dir}`);
  }
  return normalized;
}

/**
 * Default file routing — designed to match the shape that real-world
 * Go SDKs ship (stripe-go / openai-go / anthropic-sdk-go):
 *
 *  - All schema-derived data types (structs, enum type aliases, enum
 *    const blocks, multi-2xx response interfaces + concrete cases)
 *    consolidate into `models.go`.
 *  - Each tag's API surface (`<Tag>API` interface + `NetHTTP<Tag>API`
 *    struct + constructor + all methods + marker-method funcs) lands
 *    in a single `<tag>.go` file.
 *  - The IR `interfaceOnly: true` mode still works — interfaces drop
 *    into the same `<tag>.go` file with only the methods missing.
 *
 * Drops the file count from O(schemas + 2 × ops) to roughly
 * `1 + #tags + #runtime_files` (~30 files for a 600-schema spec).
 */
/** Placement is attached by the emitter; schema-derived decls default
 *  to `models.go`. */
export function declFileName(decl: GoDecl): string {
  return decl.file ?? "models.go";
}
