import type { TsDsl } from "@hey-api/openapi-ts";

import { ValueNode, type ValueNodeOptions } from "./value-node.js";

/** Holds one `$` DSL node, or a string of code the DSL can't build. */
export class TsStatementNode extends ValueNode<TsDsl | string> {
  constructor(
    statement: TsDsl | string,
    options: ValueNodeOptions = { name: "anon" },
  ) {
    super(statement, { ...options, scope: options.scope ?? "value" });
  }
}
