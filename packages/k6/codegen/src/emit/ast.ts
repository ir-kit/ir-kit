import { $, type TsDsl } from "@hey-api/openapi-ts";

import type { ModuleImport } from "../print.js";

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

/** `export const <localName> = <sourceVar>.<sourceProp>;` */
export function reExportConst(
  localName: string,
  sourceVar: string,
  sourceProp: string,
): TsDsl {
  return $.const(localName).export().assign($(sourceVar).attr(sourceProp));
}

/** `export default <sourceVar>.<sourceProp>;` — the DSL has no export-assignment node. */
export function defaultExportProp(
  sourceVar: string,
  sourceProp: string,
): string {
  return `export default ${sourceVar}.${sourceProp};`;
}
