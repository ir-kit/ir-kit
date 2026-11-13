export type SpecFormat =
  | "openapi3"
  | "asyncapi3"
  | "typespec"
  | "proto"
  | "postman"
  | "json-schema";

export type SpecDocument = Record<string, unknown>;

export type ConvertOutput =
  | { kind: "document"; document: SpecDocument }
  | { kind: "source"; source: string; ext: string }
  | { kind: "files"; files: Record<string, string> };

export interface ConvertHandlerOptions {
  cwd?: string;
  upstream?: Record<string, unknown>;
}

interface ConverterEdge {
  from: SpecFormat;
  to: SpecFormat;
  /** The edge only accepts input written for it (e.g. TypeSpec using the protobuf library), so routes may start with it but never pass through it. */
  authoredInputOnly?: boolean;
}

/** A converter reads either a parsed document or, for source formats like `.tsp` and `.proto`, a file path. */
export type ConverterPair = ConverterEdge &
  (
    | {
        input?: "document";
        handler: (
          document: SpecDocument,
          options: ConvertHandlerOptions,
        ) => Promise<ConvertOutput>;
      }
    | {
        input: "file";
        handler: (
          path: string,
          options: ConvertHandlerOptions,
        ) => Promise<ConvertOutput>;
      }
  );
