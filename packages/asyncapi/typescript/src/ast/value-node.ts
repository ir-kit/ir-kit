import type {
  AnalysisContext,
  Symbol as CoreSymbol,
  File,
  Node as ICoreNode,
  NodeScope,
  Ref,
} from "@hey-api/codegen-core";
import { nodeBrand, ref } from "@hey-api/codegen-core";

export interface ValueNodeOptions {
  name: string;
  exported?: boolean;
  root?: boolean;
  scope?: NodeScope;
}

/** INode carrying an already-built value that `toAst()` hands back unchanged. */
export class ValueNode<T> implements ICoreNode<T> {
  readonly "~brand" = nodeBrand;
  readonly language = "typescript";
  meta: unknown = undefined;
  exported?: boolean;
  root: boolean;
  scope?: NodeScope;
  symbol?: CoreSymbol;
  file?: File;

  private _name: Ref<string>;
  private readonly _value: T;

  constructor(value: T, options: ValueNodeOptions) {
    this._value = value;
    this._name = ref(options.name);
    this.exported = options.exported;
    this.root = options.root ?? true;
    this.scope = options.scope;
  }

  get name(): ICoreNode["name"] {
    return {
      ...this._name,
      set: (value) => {
        this._name = ref(typeof value === "string" ? value : String(value));
      },
      toString: () => this._name["~ref"],
    } as ICoreNode["name"];
  }

  analyze(_: AnalysisContext): void {}

  clone(): this {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    return cloned;
  }

  toAst(): T {
    return this._value;
  }
}
