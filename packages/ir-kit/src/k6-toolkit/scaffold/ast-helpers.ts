import { $ } from "@hey-api/openapi-ts";
import type { Expr } from "../../sdk/k6/emit/ast.js";

export type { Expr };

/** `{ k: v, … }` — multiline optional. Shared by loadtest scaffolders. */
export function objLit(props: Record<string, Expr>, multiline = false): Expr {
  const obj = $.object();
  if (multiline) obj.pretty();
  for (const [key, value] of Object.entries(props)) obj.prop(key, value);
  return obj;
}
