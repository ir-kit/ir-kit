import { synthName } from "../../../codegen/index.js";
import {
  type Schema,
  type SchemaToTypeOps,
  uniqueEnumEntries,
} from "../../../openapi/index.js";

import type { KtDecl } from "../ast/index.js";
import {
  type KtType,
  ktAnnotation,
  ktDataClass,
  ktEnum,
  ktEnumEntry,
  ktInt,
  ktJsonElement,
  ktList,
  ktMap,
  ktNullable,
  ktProp,
  ktRef,
  ktStr,
  ktString,
  ktTypeAlias,
  ktUnit,
} from "../ast/index.js";
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
  anyType: () => ktJsonElement,
  // `null`-typed primitive → `Any?`.
  nullableAnyType: () => ktNullable(ktJsonElement),
  // Single non-null + nullable → wrap in nullable iff not already.
  wrapForUnionSingle: (inner, nullable) =>
    nullable ? ktNullable(inner) : inner,
  unionFallback: (nullable) =>
    nullable ? ktNullable(ktJsonElement) : ktJsonElement,
  primitiveType: typeForPrimitive,
  // kotlinx convention: `Owner_Property` (underscore joiner).
  synthName,
  buildStructDecl: (name, properties, ctx, dispatch) => {
    const props = properties.map(
      ({ jsonKey, schema: propSchema, required, propPathSegment }) => {
        const naming = propertyName(jsonKey);
        const t = dispatch(propSchema as Schema, {
          emit: ctx.emit,
          names: ctx.names,
          ownerName: name,
          propPath: [propPathSegment],
        });
        const optional = !required;
        const finalType = optional ? ktNullable(t) : t;
        return ktProp({
          name: naming.kotlinName,
          type: finalType,
          default: optional ? "null" : undefined,
          annotations: naming.renamed
            ? [ktAnnotation("SerialName", ktStr(naming.jsonKey))]
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
    const idents = uniqueEnumEntries(
      rawValues,
      enumEntryIdent,
      (b, n) => `${b}_${n}`,
    );
    const entries = idents.map(({ identifier, raw }) =>
      ktEnumEntry(identifier, ktStr(raw), [
        ktAnnotation("SerialName", ktStr(raw)),
      ]),
    );
    emit(
      ktEnum({
        name,
        annotations: [ktAnnotation("Serializable")],
        properties: [ktProp({ name: "raw", type: ktString })],
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
