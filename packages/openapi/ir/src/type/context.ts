/**
 * Shared type-walker context, generic over the per-target Decl type.
 * Each emitter narrows `D` to its own AST node — `GoDecl`, `KtDecl`,
 * `SwDecl`, etc. — and re-exports a concrete alias.
 *
 * The walker uses `emit` to promote synthesised inline types
 * (objects, enums) to top-level declarations; `ownerName` and
 * `propPath` drive deterministic names for those synthesised types
 * (e.g. `Owner_Path`).
 */
export interface TypeCtx<D> {
  emit: (d: D) => void;
  /** Used to synthesise names for inline objects/enums: `Owner_Path`. */
  ownerName: string;
  propPath: ReadonlyArray<string>;
}
