import { type Namespace, pascal } from "@ir-kit/codegen-core";
import {
  classifyObject,
  classifyUnion,
  extractEnumValues,
  isSchemaObject,
  isUnionShape,
  type ObjectProperty,
  type Schema,
  type SchemaToTypeOps,
  schemaToType,
  synthTypeName,
  type TypeCtx,
} from "@ir-kit/openapi";

import {
  type ProtoDecl,
  type ProtoField,
  type ProtoMessage,
  type ProtoType,
  protoTimestamp,
  protoValue,
  scalar,
} from "./ast.js";
import {
  defaultJsonName,
  fieldIdent,
  newFieldNames,
  upperSnake,
} from "./names.js";

export interface ProtoState {
  names: Namespace;
  /** Enum value names are package-scoped (C++ scoping rules). */
  enumValues: Set<string>;
  /** Names declared (or about to be declared) as enums. */
  enums: Set<string>;
  /** Component schemas that don't declare a message or enum of their
   *  own (`$ref`s, arrays, maps, scalars). Proto has no type aliases, so
   *  each reference is replaced by the aliased type. */
  aliases: Map<string, Schema>;
  decls: ProtoDecl[];
}

export type ProtoCtx = TypeCtx<ProtoDecl>;

export interface ProtoOps extends SchemaToTypeOps<ProtoType, ProtoDecl> {
  dispatch(schema: Schema, ctx: ProtoCtx): ProtoType;
  ctx(ownerName: string, propPath?: ReadonlyArray<string>): ProtoCtx;
  /** Message with one field per property. */
  message(
    name: string,
    properties: ReadonlyArray<ObjectProperty>,
    comment?: string,
  ): ProtoMessage;
  /** Message holding a `oneof` with one field per union branch. */
  oneofMessage(
    name: string,
    schema: Schema,
    labels?: ReadonlyArray<string>,
  ): ProtoMessage;
  /** Message wrapping a single value of any type in field `value`. */
  wrapperMessage(name: string, type: ProtoType): ProtoMessage;
  /** Schema that becomes its own message when given a name: a plain
   *  object or a multi-branch union. */
  isMessageShape(schema: Schema): boolean;
}

export function createProtoOps(state: ProtoState): ProtoOps {
  const resolved = new Map<string, ProtoType>();
  const resolving = new Set<string>();
  const emit = (d: ProtoDecl) => {
    state.decls.push(d);
  };
  const named = (name: string): ProtoType => ({
    kind: "named",
    name,
    isEnum: state.enums.has(name),
  });

  const ctx = (
    ownerName: string,
    propPath: ReadonlyArray<string> = [],
  ): ProtoCtx => ({ emit, names: state.names, ownerName, propPath });

  const dispatch = (s: Schema, c: ProtoCtx): ProtoType =>
    schemaToType(s, c, ops);

  const resolveAlias = (name: string, schema: Schema): ProtoType => {
    const done = resolved.get(name);
    if (done) return done;
    // An alias chain that loops without passing through a message has no
    // finite proto type.
    if (resolving.has(name)) return protoValue;
    resolving.add(name);
    const type = dispatch(schema, ctx(name, ["Item"]));
    resolving.delete(name);
    resolved.set(name, type);
    return type;
  };

  /** Repeated and map types can't nest, appear in a `oneof`, or be
   *  `optional`; box them in a single-field message where they'd be
   *  illegal. */
  const slot = (
    type: ProtoType,
    owner: string,
    segment: string,
    inOneof: boolean,
  ): ProtoType => {
    if (type.kind !== "repeated" && type.kind !== "map") return type;
    if (inOneof) return box(type, owner, segment);
    if (type.kind === "repeated") {
      const elem = type.elem;
      return {
        kind: "repeated",
        elem:
          elem.kind === "repeated" || elem.kind === "map"
            ? box(elem, owner, `${segment}Item`)
            : elem,
      };
    }
    const value = type.value;
    return {
      kind: "map",
      value:
        value.kind === "repeated" || value.kind === "map"
          ? box(value, owner, `${segment}Value`)
          : value,
    };
  };

  const box = (type: ProtoType, owner: string, segment: string): ProtoType => {
    const key = `box:${owner}/${segment}`;
    const existing = state.names.get(key);
    if (existing) return named(existing);
    const name = state.names.claim(key, `${owner}${segment}`);
    emit(wrapperMessage(name, type));
    return named(name);
  };

  const wrapperMessage = (name: string, type: ProtoType): ProtoMessage => ({
    kind: "message",
    name,
    fields: [
      {
        name: type.kind === "repeated" ? "items" : "value",
        number: 1,
        type: slot(type, name, "Value", false),
      },
    ],
    oneofs: [],
  });

  const message = (
    name: string,
    properties: ReadonlyArray<ObjectProperty>,
    comment?: string,
  ): ProtoMessage => {
    const fieldNames = newFieldNames();
    const numbers = fieldNumbers();
    const jsonNames = new Set<string>();
    const fields = properties.map((p, i): ProtoField => {
      // Keys can repeat (a path and a query parameter both named `id`) or
      // snake_case to the same name, so claim per position and derive
      // synthesized type names from the unique field name.
      const fieldName = fieldNames.claim(String(i), p.jsonKey);
      const segment = pascal(fieldName);
      const raw = dispatch(p.schema, ctx(name, [segment]));
      const type = slot(raw, name, segment, false);
      const jsonName =
        defaultJsonName(fieldName) === p.jsonKey || jsonNames.has(p.jsonKey)
          ? undefined
          : p.jsonKey;
      jsonNames.add(jsonName ?? defaultJsonName(fieldName));
      return {
        name: fieldName,
        number: numbers(),
        type,
        optional:
          !p.required &&
          (type.kind === "scalar" || (type.kind === "named" && type.isEnum)),
        jsonName,
        deprecated: p.schema.deprecated === true || undefined,
        comment: p.schema.description,
      };
    });
    return { kind: "message", name, fields, oneofs: [], comment };
  };

  /** `labels[i]` names branch `i`'s field and synthesized type; branches
   *  are otherwise named after their type. */
  const oneofMessage = (
    name: string,
    schema: Schema,
    labels?: ReadonlyArray<string>,
  ): ProtoMessage => {
    const fieldNames = newFieldNames();
    fieldNames.claim("variant");
    const fields = unionBranches(schema).map((branch, i): ProtoField => {
      const label = labels?.[i];
      const segment = label ? pascal(label) : `Option${i + 1}`;
      const type = slot(
        dispatch(branch, ctx(name, [segment])),
        name,
        segment,
        true,
      );
      return {
        name: fieldNames.claim(String(i), label ?? branchFieldName(type)),
        number: i + 1,
        type,
        comment: branch.description,
      };
    });
    return {
      kind: "message",
      name,
      fields: [],
      oneofs: [{ name: "variant", fields }],
      comment: schema.description,
    };
  };

  const isMessageShape = (schema: Schema): boolean => {
    if (schema.$ref || extractEnumValues(schema)?.length) return false;
    if (isUnionShape(schema)) {
      const shape = classifyUnion(schema).kind;
      return shape === "multi" || shape === "intersection-with-properties";
    }
    return (
      schema.type === "object" && classifyObject(schema).kind === "named-struct"
    );
  };

  const ops: ProtoOps = {
    dispatch,
    ctx,
    message,
    oneofMessage,
    wrapperMessage,
    isMessageShape,
    refType(name) {
      const alias = state.aliases.get(name);
      return alias ? resolveAlias(name, alias) : named(name);
    },
    arrayType: (elem) => ({ kind: "repeated", elem }),
    mapType: (value) => ({ kind: "map", value }),
    voidType: () => protoValue,
    anyType: () => protoValue,
    nullableAnyType: () => protoValue,
    wrapForUnionSingle: (inner) => inner,
    unionFallback: () => protoValue,
    primitiveType: primitive,
    synthName: (owner, path) => `${owner}${path.map(pascal).join("")}`,
    buildStructDecl: (name, properties) => message(name, properties),
    multiUnion(schema, c) {
      const name = synthTypeName(c, ops);
      emit(oneofMessage(name, schema));
      return named(name);
    },
    emitStringEnum(name, raws, emitDecl) {
      state.enums.add(name);
      const prefix = upperSnake(name);
      // protoc also rejects values of one enum that only differ by case
      // or underscores once the prefix is stripped (`GMT_0` vs `GMT0`).
      const folded = new Set<string>();
      const claim = (suffix: string): string => {
        const base = `${prefix}_${suffix}`;
        for (let n = 1; ; n++) {
          const candidate = n === 1 ? base : `${base}_${n}`;
          const fold = candidate
            .slice(prefix.length)
            .replace(/_/g, "")
            .toLowerCase();
          if (state.enumValues.has(candidate) || folded.has(fold)) continue;
          state.enumValues.add(candidate);
          folded.add(fold);
          return candidate;
        }
      };
      const values = [{ name: claim("UNSPECIFIED"), number: 0 }];
      for (const raw of new Set(raws)) {
        values.push({
          name: claim(upperSnake(raw) || "EMPTY"),
          number: values.length,
        });
      }
      emitDecl({ kind: "enum", name, values });
      return named(name);
    },
    emitIntegerEnum: (_name, raws) =>
      scalar(raws.every((n) => Math.abs(n) < 2 ** 31) ? "int32" : "int64"),
  };
  return ops;
}

function primitive(schema: Schema): ProtoType | undefined {
  const types = (
    Array.isArray(schema.type) ? schema.type : [schema.type]
  ).filter((t) => t !== undefined && t !== "null");
  if (types.length !== 1) return undefined;
  const format = schema.format;
  switch (types[0]) {
    case "string":
      if (format === "binary" || format === "byte") return scalar("bytes");
      if (format === "date-time") return protoTimestamp;
      return scalar("string");
    case "integer":
      if (format === "int32") return scalar("int32");
      if (format === "uint32") return scalar("uint32");
      if (format === "uint64") return scalar("uint64");
      return scalar("int64");
    case "number":
      if (format === "float") return scalar("float");
      if (format === "int32") return scalar("int32");
      if (format === "int64") return scalar("int64");
      return scalar("double");
    case "boolean":
      return scalar("bool");
    default:
      return undefined;
  }
}

function unionBranches(schema: Schema): Schema[] {
  const listed = schema.oneOf ?? schema.anyOf;
  if (listed) {
    return listed
      .filter((b): b is Schema => isSchemaObject(b))
      .filter((b) => b.type !== "null");
  }
  const types = Array.isArray(schema.type) ? schema.type : [];
  return types.filter((t) => t !== "null").map((t) => ({ ...schema, type: t }));
}

function branchFieldName(type: ProtoType): string {
  switch (type.kind) {
    case "scalar":
      return `${type.name}_value`;
    case "named":
      return fieldIdent(type.name.split(".").pop() ?? type.name);
    default:
      return "value";
  }
}

/** Sequential field numbers, skipping protobuf's reserved 19000–19999. */
function fieldNumbers(): () => number {
  let n = 0;
  return () => {
    n++;
    if (n === 19000) n = 20000;
    return n;
  };
}
