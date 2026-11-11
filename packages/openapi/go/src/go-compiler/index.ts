import { go } from "@ir-kit/compiler-go";

import type { GoDecl } from "../go-dsl/decl/types.js";
import type { GoExpr } from "../go-dsl/expr/types.js";
import type { GoFile } from "../go-dsl/file.js";
import type { GoStmt } from "../go-dsl/stmt/types.js";
import type { GoType } from "../go-dsl/type/types.js";
import {
  lowerDecl,
  lowerExpr,
  lowerFile,
  lowerStmt,
  lowerType,
} from "./lower.js";

const printer = go.createPrinter();
const print = (node: go.Node) => printer.printFile(node);
const trimEnd = (s: string) => s.replace(/\n+$/, "");

export function printFile(file: GoFile): string {
  return `${trimEnd(print(lowerFile(file)))}\n`;
}
export const printDecl = (d: GoDecl): string => trimEnd(print(lowerDecl(d)));
export const printExpr = (e: GoExpr): string => trimEnd(print(lowerExpr(e)));
export const printStmt = (s: GoStmt): string => trimEnd(print(lowerStmt(s)));
export const printType = (t: GoType): string => trimEnd(print(lowerType(t)));

export {
  lowerDecl,
  lowerExpr,
  lowerFile,
  lowerStmt,
  lowerType,
} from "./lower.js";
