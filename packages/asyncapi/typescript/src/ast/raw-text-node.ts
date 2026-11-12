import { ValueNode } from "./value-node.js";

/** INode wrapper around pre-rendered text. Used for generated text and bundle copies. */
export class RawTextNode extends ValueNode<string> {
  constructor(text: string, options: { name?: string } = {}) {
    super(text, { name: options.name ?? "raw" });
  }
}
