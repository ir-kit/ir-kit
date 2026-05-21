import type { IR } from "@hey-api/shared";
import { assertNoEnumCollisions, classifyEnumLiterals } from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";
import {
  type KtType,
  ktAnnotation,
  ktEnum,
  ktEnumEntry,
  ktInt,
  ktProp,
  ktRef,
  ktString,
  ktTypeAlias,
} from "../../kt-dsl/index.js";
import { enumEntryIdent } from "../identifiers.js";
import type { TypeCtx } from "./context.js";

/**
 * Convert an `IR.SchemaObject` whose `type === "enum"` into a Kotlin
 * type:
 *
 *  - All-string members → `@Serializable enum class Foo(val raw: String)`
 *    with one entry per value, each carrying `@SerialName("<raw>")` so
 *    kotlinx-serialization preserves the wire form.
 *  - All-integer members → degrade to `typealias Foo = Int`. kotlinx-
 *    serialization's enum support only round-trips string raw values
 *    via `@SerialName`; integer JSON values would need a custom
 *    `KSerializer`. The typealias preserves the underlying type and
 *    keeps the field shape compatible with the wire format; consumers
 *    lose the enum-value constraint at the type level but retain it at
 *    runtime through their own validation if needed.
 *
 * Mixed-type enums throw — pick one shape.
 */
export function buildEnumFromIR(
  name: string,
  schema: IR.SchemaObject,
  emit: TypeCtx["emit"],
): KtType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer") {
    emit(ktTypeAlias({ name, type: ktInt }));
    return ktRef(name);
  }

  const stringRaws = rawValues as string[];
  const idents = stringRaws.map((raw) => ({
    identifier: enumEntryIdent(raw),
    raw,
  }));
  assertNoEnumCollisions(name, idents);
  const entries = idents.map(({ identifier, raw }) =>
    ktEnumEntry(identifier, JSON.stringify(raw), [
      ktAnnotation("SerialName", JSON.stringify(raw)),
    ]),
  );
  emit(
    ktEnum({
      name,
      annotations: [ktAnnotation("Serializable")],
      properties: [ktProp({ name: "raw", type: ktString, inPrimary: true })],
      entries,
    }),
  );
  return ktRef(name);
}
