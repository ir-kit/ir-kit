import type ts from "typescript";

import { ValueNode, type ValueNodeOptions } from "./value-node.js";

/** INode wrapper around a `ts.Statement`. Mirrors hey-api's `TsDsl` base. */
export class TsStatementNode extends ValueNode<ts.Statement> {
  constructor(
    statement: ts.Statement,
    options: ValueNodeOptions = { name: "anon" },
  ) {
    super(statement, { ...options, scope: options.scope ?? "value" });
  }
}
