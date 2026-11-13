export type ProtoScalar =
  | "double"
  | "float"
  | "int32"
  | "int64"
  | "uint32"
  | "uint64"
  | "bool"
  | "string"
  | "bytes";

export type ProtoType =
  | { kind: "scalar"; name: ProtoScalar }
  | { kind: "named"; name: string; isEnum: boolean; import?: string }
  | { kind: "repeated"; elem: ProtoType }
  | { kind: "map"; value: ProtoType };

export interface ProtoField {
  name: string;
  number: number;
  type: ProtoType;
  optional?: boolean;
  jsonName?: string;
  deprecated?: boolean;
  comment?: string;
}

export interface ProtoOneof {
  name: string;
  fields: ProtoField[];
}

export interface ProtoMessage {
  kind: "message";
  name: string;
  fields: ProtoField[];
  oneofs: ProtoOneof[];
  comment?: string;
}

export interface ProtoEnum {
  kind: "enum";
  name: string;
  values: Array<{ name: string; number: number }>;
  comment?: string;
}

export type ProtoDecl = ProtoMessage | ProtoEnum;

export interface ProtoRpc {
  name: string;
  request: ProtoType;
  response: ProtoType;
  deprecated?: boolean;
  comment?: string;
}

export interface ProtoService {
  name: string;
  rpcs: ProtoRpc[];
  comment?: string;
}

export interface ProtoFile {
  package: string;
  decls: ProtoDecl[];
  services: ProtoService[];
}

export const scalar = (name: ProtoScalar): ProtoType => ({
  kind: "scalar",
  name,
});

const wellKnown = (name: string, file: string): ProtoType => ({
  kind: "named",
  name: `google.protobuf.${name}`,
  isEnum: false,
  import: `google/protobuf/${file}.proto`,
});

export const protoValue = wellKnown("Value", "struct");
export const protoEmpty = wellKnown("Empty", "empty");
export const protoTimestamp = wellKnown("Timestamp", "timestamp");

export const isMessageType = (t: ProtoType): boolean =>
  t.kind === "named" && !t.isEnum;
