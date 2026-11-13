import type { $, TypeTsDsl } from "@hey-api/openapi-ts";

/** A value the `$` DSL accepts as a call argument, array element, property value and initializer. */
export type Expr = Extract<
  Parameters<typeof $.array>[number],
  Extract<
    NonNullable<Parameters<ReturnType<typeof $.object>["prop"]>[1]>,
    Parameters<ReturnType<typeof $.const>["assign"]>[0]
  >
>;

/** A type built with `$.type`. */
export type TypeExpr = TypeTsDsl;
