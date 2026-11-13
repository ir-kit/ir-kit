import { $, type TsDsl } from "@hey-api/openapi-ts";

/** A value the DSL accepts both as an object property and as an initializer. */
export type Expr = Extract<
  NonNullable<Parameters<ReturnType<typeof $.object>["prop"]>[1]>,
  Parameters<ReturnType<typeof $.const>["assign"]>[0]
>;

/** `{ k: v, … }` — multiline optional. Shared by loadtest scaffolders. */
export function objLit(props: Record<string, Expr>, multiline = false): Expr {
  const obj = $.object();
  if (multiline) obj.pretty();
  for (const [key, value] of Object.entries(props)) obj.prop(key, value);
  return obj;
}

/** `const <name> = <init>;` */
export function varConst(name: string, init: Expr): TsDsl {
  return $.const(name).assign(init);
}
