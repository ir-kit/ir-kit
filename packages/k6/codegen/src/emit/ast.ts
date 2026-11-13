import { $, type TsDsl } from "@hey-api/openapi-ts";

import { type ModuleImport, printModule } from "../print.js";

export type { Expr, TypeExpr } from "../dsl.js";

export {
  type ModuleImport,
  type PrintModuleInput,
  printModule,
} from "../print.js";

export interface NamedImportSpec {
  /** Name exported by the module. */
  name: string;
  /** Local alias. Omit to use `name` as-is. */
  alias?: string;
  /** `true` → `import type { … }`. */
  typeOnly?: boolean;
}

/** `import { a, b as c } from "mod";` */
export function namedImport(
  specs: ReadonlyArray<string | NamedImportSpec>,
  modulePath: string,
  options: { typeOnly?: boolean } = {},
): ModuleImport {
  return {
    imports: specs.map((spec) => {
      const s = typeof spec === "string" ? { name: spec } : spec;
      return {
        isTypeOnly: s.typeOnly ?? false,
        localName: s.alias ?? s.name,
        sourceName: s.name,
      };
    }),
    isTypeOnly: options.typeOnly ?? false,
    kind: "named",
    modulePath,
  };
}

/** `import * as name from "mod";` (add `typeOnly: true` for `import type * as name`). */
export function namespaceImport(
  name: string,
  modulePath: string,
  options: { typeOnly?: boolean } = {},
): ModuleImport {
  return {
    imports: [],
    isTypeOnly: options.typeOnly ?? false,
    kind: "namespace",
    localName: name,
    modulePath,
  };
}

/** `import name from "mod";` */
export function defaultImport(name: string, modulePath: string): ModuleImport {
  return {
    imports: [],
    isTypeOnly: false,
    kind: "default",
    localName: name,
    modulePath,
  };
}

/**
 * Print a loadtest file. `nodes` must declare `const lt = defineLoadTest(…)`;
 * `options` and the default export are re-exported from it.
 */
export function printLoadtest(input: {
  header?: string;
  imports: ReadonlyArray<ModuleImport>;
  nodes: ReadonlyArray<TsDsl>;
}): string {
  return printModule({
    ...input,
    nodes: [
      ...input.nodes,
      $.const("options").export().assign($("lt").attr("options")),
    ],
    footer: "export default lt.default;",
  });
}
