import {
  assertNoEnumCollisions,
  type Schema,
  type SchemaToTypeOps,
} from "@ir-kit/openapi";

import type { GoDecl } from "../go-dsl/decl/types.js";
import {
  type GoType,
  goAny,
  goConstBlock,
  goConstEntry,
  goField,
  goInt,
  goIntLit,
  goMap,
  goPtr,
  goRef,
  goSlice,
  goStr,
  goString,
  goStruct,
  goTypeAlias,
} from "../go-dsl/index.js";
import { enumEntrySuffix, synthName } from "./identifiers.js";
import { typeForPrimitive } from "./type/primitive.js";
import { propertyName } from "./type/property-naming.js";

const isMapOrSlice = (t: GoType): boolean =>
  t.kind === "map" || t.kind === "slice";

const isPointerable = (t: GoType): boolean =>
  t.kind !== "ptr" &&
  t.kind !== "slice" &&
  t.kind !== "map" &&
  t.kind !== "interface";

function integerEntrySuffix(n: number): string {
  return n < 0 ? `Neg${Math.abs(n)}` : String(n);
}

/**
 * Go's plug into the shared `schemaToType` dispatcher. Every per-target
 * rendering choice lives here — pointer-wrap for optional fields,
 * no-separator `synthName` (per `go vet`), JSON struct tags with
 * `omitempty`, typed-const enum blocks.
 */
export const goOps: SchemaToTypeOps<GoType, GoDecl> = {
  refType: goRef,
  arrayType: goSlice,
  mapType: (value) => goMap(goString, value),
  voidType: () => goAny,
  anyType: () => goAny,
  nullableAnyType: () => goPtr(goAny),
  wrapForUnionSingle: (inner, nullable) =>
    nullable && isPointerable(inner) ? goPtr(inner) : inner,
  unionFallback: () => goAny,
  primitiveType: typeForPrimitive,
  synthName,
  buildStructDecl: (name, properties, ctx, dispatch) => {
    const fields = properties.map(
      ({ jsonKey, schema: propSchema, required, propPathSegment }) => {
        const naming = propertyName(jsonKey);
        const t = dispatch(propSchema as Schema, {
          emit: ctx.emit,
          ownerName: name,
          propPath: [propPathSegment],
        });
        const optional = !required;
        const finalType =
          optional && t.kind !== "ptr" && !isMapOrSlice(t) ? goPtr(t) : t;
        const tag = optional
          ? `\`json:"${naming.jsonKey},omitempty"\``
          : `\`json:"${naming.jsonKey}"\``;
        return goField(naming.goName, finalType, tag);
      },
    );
    return goStruct({ name, fields });
  },
  emitStringEnum: (name, rawValues, emit) => {
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
  },
  emitIntegerEnum: (name, rawValues, emit) => {
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
  },
};
