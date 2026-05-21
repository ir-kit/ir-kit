import { safeCaseName, synthName } from "@ir-kit/codegen-core";
import {
  assertNoEnumCollisions,
  type Schema,
  type SchemaToTypeOps,
} from "@ir-kit/openapi";

import type { SwCodingKeysEntry, SwDecl, SwType } from "../sw-dsl/index.js";
import {
  swAny,
  swArray,
  swDict,
  swEnum,
  swEnumCase,
  swFunParam,
  swInit,
  swInt,
  swOptional,
  swProp,
  swRef,
  swString,
  swStruct,
  swVoid,
} from "../sw-dsl/index.js";
import { typeForPrimitive } from "./type/primitive.js";
import { propertyName } from "./type/property-naming.js";

function intCaseName(n: number): string {
  return n < 0 ? `_neg${Math.abs(n)}` : `_${n}`;
}

/**
 * Swift's plug into the shared `schemaToType` dispatcher. Per-target
 * choices: `Codable` conformance; `CodingKeys` rename block when any
 * property has a non-camelCase JSON key; `[String: V]` for additional-
 * properties; `enum: String, Codable` (or `: Int, Codable`) for
 * primitive-typed enums with `_<digit>` case names for ints.
 */
export const swOps: SchemaToTypeOps<SwType, SwDecl> = {
  refType: swRef,
  arrayType: swArray,
  mapType: (value) => swDict(swString, value),
  voidType: () => swVoid,
  anyType: () => swAny,
  nullableAnyType: () => swOptional(swAny),
  wrapForUnionSingle: (inner, nullable) =>
    nullable && inner.kind !== "optional" ? swOptional(inner) : inner,
  unionFallback: (nullable) => (nullable ? swOptional(swAny) : swAny),
  primitiveType: typeForPrimitive,
  // Swift convention: `Owner_Property` (underscore joiner).
  synthName,
  buildStructDecl: (name, properties, ctx, dispatch) => {
    const entries = properties.map(
      ({ jsonKey, schema: propSchema, required, propPathSegment }) => {
        const naming = propertyName(jsonKey);
        const t = dispatch(propSchema as Schema, {
          emit: ctx.emit,
          ownerName: name,
          propPath: [propPathSegment],
        });
        const optional = !required;
        const finalType = optional && t.kind !== "optional" ? swOptional(t) : t;
        return { naming, type: finalType, optional };
      },
    );

    const structProps = entries.map(({ naming, type }) =>
      swProp({ name: naming.swiftName, type }),
    );

    const anyRenamed = entries.some(({ naming }) => naming.renamed);
    const codingKeys: ReadonlyArray<SwCodingKeysEntry> | undefined = anyRenamed
      ? entries.map(({ naming }) => ({
          swiftName: naming.swiftName,
          jsonKey: naming.jsonKey,
        }))
      : undefined;

    const initParams = entries.map(({ naming, type, optional }) =>
      swFunParam({
        name: naming.swiftName,
        type,
        default: optional ? "nil" : undefined,
      }),
    );

    return swStruct({
      name,
      properties: structProps,
      conforms: ["Codable"],
      codingKeys,
      inits: initParams.length > 0 ? [swInit({ params: initParams })] : [],
    });
  },
  emitStringEnum: (name, rawValues, emit) => {
    const idents: Array<{ identifier: string; raw: string | number }> =
      rawValues.map((raw) => ({ identifier: safeCaseName(raw), raw }));
    assertNoEnumCollisions(name, idents, "case name");
    const cases = idents.map(({ identifier, raw }) =>
      swEnumCase(identifier, raw),
    );
    emit(
      swEnum({
        name,
        cases,
        rawType: swString,
        conforms: ["Codable"],
      }),
    );
    return swRef(name);
  },
  emitIntegerEnum: (name, rawValues, emit) => {
    const idents: Array<{ identifier: string; raw: string | number }> =
      rawValues.map((raw) => ({ identifier: intCaseName(raw), raw }));
    assertNoEnumCollisions(name, idents, "case name");
    const cases = idents.map(({ identifier, raw }) =>
      swEnumCase(identifier, raw),
    );
    emit(
      swEnum({
        name,
        cases,
        rawType: swInt,
        conforms: ["Codable"],
      }),
    );
    return swRef(name);
  },
};
