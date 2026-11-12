import { pascal, synthName } from "@ir-kit/codegen-core";
import { java } from "@ir-kit/compiler-java";
import {
  type Schema,
  type SchemaToTypeOps,
  uniqueEnumEntries,
} from "@ir-kit/openapi";
import {
  type JEmitted,
  type JType,
  jAnnotation,
  jIdent,
  jInteger,
  jList,
  jLit,
  jMap,
  jObject,
  jParam,
  jRecord,
  jRef,
  jValueEnum,
  jVoid,
} from "../ast/index.js";
import { enumEntryIdent } from "./identifiers.js";
import { typeForPrimitive } from "./type/primitive.js";
import { propertyName } from "./type/property-naming.js";

export const javaOps: SchemaToTypeOps<JType, JEmitted> = {
  refType: (name) => jRef(name),
  arrayType: jList,
  mapType: jMap,
  voidType: () => jVoid,
  anyType: () => jObject,
  nullableAnyType: () => jObject,
  wrapForUnionSingle: (inner) => inner,
  unionFallback: () => jObject,
  primitiveType: typeForPrimitive,
  synthName: (owner, path) => pascal(synthName(owner, path)),
  buildStructDecl: (name, properties, ctx, dispatch) =>
    jRecord({
      name,
      components: properties.map(
        ({ jsonKey, schema: propSchema, propPathSegment }) => {
          const naming = propertyName(jsonKey);
          const type = dispatch(propSchema as Schema, {
            emit: ctx.emit,
            names: ctx.names,
            ownerName: name,
            propPath: [propPathSegment],
          });
          const param = jParam(naming.javaName, type);
          return naming.renamed
            ? java.factory.createMethodParameter(
                naming.javaName,
                type,
                undefined,
                [jAnnotation("JsonProperty", [jLit(jsonKey)])],
              )
            : param;
        },
      ),
    }),
  emitStringEnum: (name, rawValues, emit) => {
    emit(
      jValueEnum(
        name,
        uniqueEnumEntries(rawValues, enumEntryIdent, (b, n) => `${b}_${n}`).map(
          ({ identifier, raw }) => ({ identifier, value: jLit(raw) }),
        ),
      ),
    );
    return jRef(name);
  },
  emitIntegerEnum: (name, rawValues, emit) => {
    const values = [...new Set(rawValues.map(Number))];
    const wide = values.some((v) => v > 2147483647 || v < -2147483648);
    emit(
      jValueEnum(
        name,
        values.map((v) => ({
          identifier: v < 0 ? `VALUE_MINUS_${-v}` : `VALUE_${v}`,
          value: wide ? jIdent(`${v}L`) : jLit(v),
        })),
        jRef(wide ? "long" : "int"),
      ),
    );
    return jRef(name);
  },
};
