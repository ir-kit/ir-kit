import type {
  AsyncAPIDocumentInterface,
  Diagnostic,
  Parser,
} from "@asyncapi/parser";

import { loadOptional } from "../optional.js";

/**
 * Result of a parse — `document` is `undefined` when the spec failed to
 * validate; `diagnostics` is always populated.
 */
export interface ParseResult {
  document: AsyncAPIDocumentInterface | undefined;
  diagnostics: Diagnostic[];
}

/**
 * Input source for {@link parseSpec}.
 *
 *  - `{ kind: "file"; path }` — local filesystem path. `$ref`s resolve
 *    relative to the file.
 *  - `{ kind: "url"; url }` — fetched over HTTP(S).
 *  - `{ kind: "string"; spec }` — already-loaded YAML / JSON. `$ref`s must
 *    be self-contained or to URLs the parser can fetch.
 */
export type ParseInput =
  | { kind: "file"; path: string }
  | { kind: "url"; url: string }
  | { kind: "string"; spec: string };

let sharedParser: Promise<{ parser: Parser; parserModule: ParserModule }>;
type ParserModule = typeof import("@asyncapi/parser");

const PACKAGES = [
  "@asyncapi/parser",
  "@asyncapi/avro-schema-parser",
  "@asyncapi/openapi-schema-parser",
];

function getParser() {
  sharedParser ??= loadOptional(
    async () => {
      const [parserModule, avro, openapi] = await Promise.all([
        import("@asyncapi/parser"),
        import("@asyncapi/avro-schema-parser"),
        import("@asyncapi/openapi-schema-parser"),
      ]);
      const parser = new parserModule.Parser({
        schemaParsers: [avro.AvroSchemaParser(), openapi.OpenAPISchemaParser()],
      });
      return { parser, parserModule };
    },
    "AsyncAPI input",
    PACKAGES,
  );
  return sharedParser;
}

/**
 * Parse an AsyncAPI 3.x spec from a file, URL, or string. Delegates to
 * `@asyncapi/parser` — does not throw on validation failure; inspect
 * `result.diagnostics` and check `result.document !== undefined`.
 */
export async function parseSpec(input: ParseInput): Promise<ParseResult> {
  const { parser, parserModule } = await getParser();
  switch (input.kind) {
    case "file":
      return parserModule.fromFile(parser, input.path).parse();
    case "url":
      return parserModule.fromURL(parser, input.url).parse();
    case "string":
      return parser.parse(input.spec);
  }
}

/**
 * Convenience: parse and throw on validation failure with a formatted
 * diagnostic summary. Use this when callers don't want to handle partial
 * results; otherwise call {@link parseSpec} directly.
 */
export async function parseSpecOrThrow(
  input: ParseInput,
): Promise<AsyncAPIDocumentInterface> {
  const { document, diagnostics } = await parseSpec(input);
  if (!document) {
    const errors = diagnostics
      .filter((d) => d.severity === 0)
      .map((d) => `  - ${d.message} (${d.path?.join(".") ?? "<root>"})`)
      .join("\n");
    throw new Error(
      `AsyncAPI spec failed validation:\n${errors || diagnostics.map((d) => `  - ${d.message}`).join("\n")}`,
    );
  }
  return document;
}
