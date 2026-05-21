import type { IR } from "@hey-api/shared";
import { assertNoEnumCollisions, classifyEnumLiterals } from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";
import {
  type GoType,
  goConstBlock,
  goConstEntry,
  goInt,
  goIntLit,
  goRef,
  goStr,
  goString,
  goTypeAlias,
} from "../../go-dsl/index.js";
import { enumEntrySuffix } from "../identifiers.js";
import type { TypeCtx } from "./context.js";

/**
 * Convert an `IR.SchemaObject` whose `type === "enum"` into the Go
 * idiom for typed-constant enums:
 *
 *   type Status string             // (or `int` for integer enums)
 *   const (
 *       StatusAvailable Status = "available"
 *       StatusPending   Status = "pending"
 *   )
 *
 * Two decls are emitted (one type alias, one const block); the
 * caller's TypeCtx receives both via `emit`. The returned type is
 * the named-type ref so callers reference it as `Status`, not the
 * underlying primitive.
 *
 * Supports string and integer enum values. Mixed-type enums fall
 * back to a `string` type alias and stringify the values.
 */
export function buildEnumFromIR(
  name: string,
  schema: IR.SchemaObject,
  emit: TypeCtx["emit"],
): GoType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer")
    return emitIntegerEnum(name, rawValues as number[], emit);
  return emitStringEnum(name, rawValues as string[], emit);
}

function emitStringEnum(
  name: string,
  rawValues: ReadonlyArray<string>,
  emit: TypeCtx["emit"],
): GoType {
  const entries = rawValues.map((raw) => ({
    identifier: `${name}${enumEntrySuffix(raw)}`,
    raw,
  }));
  assertNoEnumCollisions(name, entries);
  emit(goTypeAlias({ name, type: goString }));
  emit(
    goConstBlock({
      type: goRef(name),
      entries: entries.map(({ identifier, raw }) =>
        goConstEntry(identifier, goStr(raw)),
      ),
      name,
    }),
  );
  return goRef(name);
}

function emitIntegerEnum(
  name: string,
  rawValues: ReadonlyArray<number>,
  emit: TypeCtx["emit"],
): GoType {
  const entries = rawValues.map((raw) => ({
    identifier: `${name}${integerEntrySuffix(raw)}`,
    raw,
  }));
  assertNoEnumCollisions(name, entries);
  emit(goTypeAlias({ name, type: goInt }));
  emit(
    goConstBlock({
      type: goRef(name),
      entries: entries.map(({ identifier, raw }) =>
        goConstEntry(identifier, goIntLit(raw)),
      ),
      name,
    }),
  );
  return goRef(name);
}

function integerEntrySuffix(n: number): string {
  return n < 0 ? `Neg${Math.abs(n)}` : String(n);
}
