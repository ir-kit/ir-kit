import { Namespace } from "@ir-kit/codegen-core";
import { type Schema, type SchemaToTypeOps } from "@ir-kit/openapi";

import type { GoDecl } from "../ast/index.js";
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
  isNilable,
} from "../ast/index.js";
import { enumEntrySuffix, exportedIdent, synthName } from "./identifiers.js";
import { typeForPrimitive } from "./type/primitive.js";
import { propertyName } from "./type/property-naming.js";

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
    nullable && !isNilable(inner) ? goPtr(inner) : inner,
  unionFallback: () => goAny,
  primitiveType: typeForPrimitive,
  synthName,
  buildStructDecl: (name, properties, ctx, dispatch) => {
    const fieldNames = new Namespace({ normalize: exportedIdent });
    const fields = properties.map(
      ({ jsonKey, schema: propSchema, required, propPathSegment }) => {
        const naming = propertyName(jsonKey);
        const goName = fieldNames.claim(jsonKey);
        const t = dispatch(propSchema as Schema, {
          emit: ctx.emit,
          names: ctx.names,
          ownerName: name,
          propPath: [propPathSegment],
        });
        const optional = !required;
        const finalType = optional && !isNilable(t) ? goPtr(t) : t;
        const tag = optional
          ? `json:"${naming.jsonKey},omitempty"`
          : `json:"${naming.jsonKey}"`;
        return goField(goName, finalType, tag);
      },
    );
    return goStruct({ name, fields });
  },
  // Go consts share the package scope with types, so entry names are
  // claimed in the same namespace as every type name.
  emitStringEnum: (name, rawValues, emit, names) => {
    const entries = [...new Set(rawValues)].map((raw) => ({
      raw,
      identifier: names.claim(
        `enum:${name}/${raw}`,
        `${name}${enumEntrySuffix(raw)}`,
      ),
    }));
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
  emitIntegerEnum: (name, rawValues, emit, names) => {
    const entries = [...new Set(rawValues)].map((raw) => ({
      raw,
      identifier: names.claim(
        `enum:${name}/${raw}`,
        `${name}${integerEntrySuffix(raw)}`,
      ),
    }));
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
