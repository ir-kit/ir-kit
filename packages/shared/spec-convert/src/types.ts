export type SpecFormat =
  | "openapi3"
  | "asyncapi3"
  | "typespec"
  | "proto"
  | "json-schema";

export type SpecDocument = Record<string, unknown>;

export type ConvertHandler = (
  document: SpecDocument,
  options: ConvertHandlerOptions,
) => Promise<SpecDocument>;

export interface ConvertHandlerOptions {
  cwd?: string;
  /** Raw flags forwarded to the upstream conversion tool, if any. */
  upstream?: Record<string, unknown>;
}

export interface ConverterPair {
  from: SpecFormat;
  to: SpecFormat;
  handler: ConvertHandler;
}
