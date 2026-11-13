import { synthName } from "../../../codegen/index.js";
import {
  type Schema,
  type SchemaToTypeOps,
  uniqueEnumEntries,
} from "../../../openapi/index.js";

import type { SwCodingKeysEntry, SwDecl, SwType } from "../ast/index.js";
import {
  swArray,
  swDict,
  swEnum,
  swEnumCase,
  swFunParam,
  swInit,
  swInt,
  swJSONValue,
  swOptional,
  swProp,
  swRef,
  swString,
  swStruct,
  swVoid,
} from "../ast/index.js";
import { caseName, escapeKeyword } from "./identifiers.js";
import { typeForPrimitive } from "./type/primitive.js";
import { type PropertyName, propertyName } from "./type/property-naming.js";

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
  anyType: () => swJSONValue,
  nullableAnyType: () => swOptional(swJSONValue),
  wrapForUnionSingle: (inner, nullable) =>
    nullable ? swOptional(inner) : inner,
  unionFallback: (nullable) =>
    nullable ? swOptional(swJSONValue) : swJSONValue,
  primitiveType: typeForPrimitive,
  // Swift convention: `Owner_Property` (underscore joiner).
  synthName,
  buildStructDecl: (name, properties, ctx, dispatch) => {
    const taken = new Set<string>();
    const entries = properties.map(
      ({ jsonKey, schema: propSchema, required, propPathSegment }) => {
        const naming = distinctName(propertyName(jsonKey), taken);
        const t = dispatch(propSchema as Schema, {
          emit: ctx.emit,
          names: ctx.names,
          ownerName: name,
          propPath: [propPathSegment],
        });
        const optional = !required;
        const finalType = optional ? swOptional(t) : t;
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
    const idents = uniqueEnumEntries(rawValues, caseName);
    const cases = idents.map(({ identifier, raw }) =>
      swEnumCase(escapeKeyword(identifier), raw),
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
    const idents = uniqueEnumEntries(rawValues, intCaseName);
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

/** Suffixes a property name already used by an earlier key of the same struct. */
function distinctName(naming: PropertyName, taken: Set<string>): PropertyName {
  const bare = naming.swiftName.replace(/`/g, "");
  let name = naming.swiftName;
  for (let n = 2; taken.has(name.replace(/`/g, "")); n++) name = `${bare}${n}`;
  taken.add(name.replace(/`/g, ""));
  return name === naming.swiftName
    ? naming
    : { ...naming, swiftName: name, renamed: true };
}
