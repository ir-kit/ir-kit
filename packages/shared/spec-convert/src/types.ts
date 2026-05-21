export type SpecFormat =
  | "openapi3"
  | "asyncapi3"
  | "typespec"
  | "proto"
  | "json-schema";

export type SpecDocument = Record<string, unknown>;

export type ConvertOutput =
  | { kind: "document"; document: SpecDocument }
  | { kind: "source"; source: string; ext: string };

export type ConvertHandler = (
  document: SpecDocument,
  options: ConvertHandlerOptions,
) => Promise<ConvertOutput>;

export interface ConvertHandlerOptions {
  cwd?: string;
  upstream?: Record<string, unknown>;
}

export interface ConverterPair {
  from: SpecFormat;
  to: SpecFormat;
  handler: ConvertHandler;
}
