import { synthName } from "@ir-kit/codegen-core";
import { assertNoEnumCollisions, type SchemaToTypeOps } from "@ir-kit/openapi";

import type { KtDecl } from "../kt-dsl/decl/types.js";
import {
  type KtType,
  ktAnnotation,
  ktAny,
  ktDataClass,
  ktEnum,
  ktEnumEntry,
  ktInt,
  ktList,
  ktMap,
  ktNullable,
  ktProp,
  ktRef,
  ktString,
  ktTypeAlias,
  ktUnit,
} from "../kt-dsl/index.js";
import { enumEntryIdent } from "./identifiers.js";
import { typeForPrimitive } from "./type/primitive.js";
import { propertyName } from "./type/property-naming.js";

/**
 * Kotlin's plug into the shared `schemaToType` dispatcher. Per-target
 * choices: `kotlinx-serialization` `@Serializable` annotations and
 * `@SerialName` rewrites for renamed JSON keys; `Map<String, V>` for
 * additionalProperties; `enum class(val raw: String)` for string
 * enums and `typealias = Int` for integer enums (kotlinx's enum
 * support only round-trips strings).
 */
export const ktOps: SchemaToTypeOps<KtType, KtDecl> = {
  refType: ktRef,
  arrayType: ktList,
  mapType: (value) => ktMap(ktString, value),
  voidType: () => ktUnit,
  anyType: () => ktAny,
  // `null`-typed primitive → `Any?`.
  nullableAnyType: () => ktNullable(ktAny),
  // Single non-null + nullable → wrap in nullable iff not already.
  wrapForUnionSingle: (inner, nullable) =>
    nullable && inner.kind !== "nullable" ? ktNullable(inner) : inner,
  unionFallback: (nullable) => (nullable ? ktNullable(ktAny) : ktAny),
  primitiveType: typeForPrimitive,
  // kotlinx convention: `Owner_Property` (underscore joiner).
  synthName,
  buildStructDecl: (name, properties, ctx, dispatch) => {
    const props = properties.map(
      ({ jsonKey, schema: propSchema, required, propPathSegment }) => {
        const naming = propertyName(jsonKey);
        const t = dispatch(propSchema, {
          emit: ctx.emit,
          ownerName: name,
          propPath: [propPathSegment],
        });
        const optional = !required;
        const finalType = optional && t.kind !== "nullable" ? ktNullable(t) : t;
        return ktProp({
          name: naming.kotlinName,
          type: finalType,
          inPrimary: true,
          default: optional ? "null" : undefined,
          annotations: naming.renamed
            ? [ktAnnotation("SerialName", JSON.stringify(naming.jsonKey))]
            : [],
        });
      },
    );
    return ktDataClass({
      name,
      annotations: [ktAnnotation("Serializable")],
      properties: props,
    });
  },
  emitStringEnum: (name, rawValues, emit) => {
    const idents = rawValues.map((raw) => ({
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
  },
  // kotlinx-serialization can't round-trip integer enums via
  // `@SerialName`; degrade to a typealias that preserves the wire
  // shape but loses enum-value constraint at the type level.
  emitIntegerEnum: (name, _rawValues, emit) => {
    emit(ktTypeAlias({ name, type: ktInt }));
    return ktRef(name);
  },
};
