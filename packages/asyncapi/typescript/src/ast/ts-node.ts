import type { TsDsl } from "@hey-api/openapi-ts";

import { ValueNode, type ValueNodeOptions } from "./value-node.js";

/** INode wrapper around a `$` DSL node, or verbatim source the DSL can't express. */
export class TsStatementNode extends ValueNode<TsDsl | string> {
  constructor(
    statement: TsDsl | string,
    options: ValueNodeOptions = { name: "anon" },
  ) {
    super(statement, { ...options, scope: options.scope ?? "value" });
  }
}
