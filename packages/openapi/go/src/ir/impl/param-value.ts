import { type GoExpr, type GoFuncParam, goIdent } from "../../go-dsl/index.js";

/**
 * Value expression for a method parameter, read off its declared type:
 * pointers are dereferenced, everything else (including nil-able slices
 * and maps) is used as-is. The signature owns the optional-wrapping
 * decision; method bodies never re-derive it.
 */
export function paramValue(
  id: string,
  params: ReadonlyArray<GoFuncParam>,
): GoExpr {
  const param = params.find((p) => p.name === id);
  return param?.type.kind === "ptr"
    ? { kind: "unary", op: "*", operand: goIdent(id) }
    : goIdent(id);
}
