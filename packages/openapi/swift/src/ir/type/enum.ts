import type { IR } from "@hey-api/shared";
import { safeCaseName } from "@ir-kit/codegen-core";
import { assertNoEnumCollisions, classifyEnumLiterals } from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import type { SwType } from "../../sw-dsl/index.js";
import {
  swEnum,
  swEnumCase,
  swInt,
  swRef,
  swString,
} from "../../sw-dsl/index.js";
import type { TypeCtx } from "./context.js";

/**
 * Convert an `IR.SchemaObject` whose `type === "enum"` into a Swift
 * raw-typed enum with `Codable` conformance:
 *
 *  - All-string members → `enum Status: String, Codable { case … }`
 *  - All-integer members → `enum Rotate: Int, Codable { case _0 = 0; case _90 = 90 }`
 *
 * Mixed-type enums throw — Swift's raw-typed enum requires a single
 * raw type. The enum is emitted as a top-level decl; the returned
 * `SwType` is a ref to it.
 */
export function buildEnumFromIR(
  name: string,
  schema: IR.SchemaObject,
  emit: TypeCtx["emit"],
): SwType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  const isInteger = kind === "integer";

  const idents: Array<{ identifier: string; raw: string | number }> = isInteger
    ? (rawValues as number[]).map((raw) => ({
        identifier: intCaseName(raw),
        raw,
      }))
    : (rawValues as string[]).map((raw) => ({
        identifier: safeCaseName(raw),
        raw,
      }));
  assertNoEnumCollisions(name, idents, "case name");
  const cases = idents.map(({ identifier, raw }) =>
    swEnumCase(identifier, raw),
  );

  emit(
    swEnum({
      name,
      cases,
      rawType: isInteger ? swInt : swString,
      conforms: ["Codable"],
    }),
  );
  return swRef(name);
}

function intCaseName(n: number): string {
  return n < 0 ? `_neg${Math.abs(n)}` : `_${n}`;
}
