import { readFileSync } from "node:fs";

/**
 * Runtime helpers that ship into every generated SDK. They live as real
 * Go sources in `packages/openapi/go/runtime/` (a vet-able `package api`)
 * and are copied verbatim; only the package clause is rewritten.
 */
const RUNTIME_DIR = new URL("../../../runtime/", import.meta.url);

export interface RuntimeOpts {
  /** Ship the multipart helper. Set when at least one op has a
   *  `multipart/form-data` body. */
  hasMultipart: boolean;
}

export interface RuntimeFile {
  name: string;
  content: string;
}

const ALWAYS = [
  "api_client.go",
  "api_error.go",
  "api_key_location.go",
  "auth.go",
  "query_style.go",
  "request_options.go",
  "url_encoding.go",
];

export const GO_RUNTIME_IDENTIFIERS: ReadonlySet<string> = new Set([
  "APIClient",
  "APIError",
  "APIErrorKind",
  "APIErrorKindClient",
  "APIErrorKindDecoding",
  "APIErrorKindEncoding",
  "APIErrorKindServer",
  "APIErrorKindTransport",
  "APIErrorKindUnexpected",
  "APIKeyAuth",
  "APIKeyCookie",
  "APIKeyHeader",
  "APIKeyLocation",
  "APIKeyQuery",
  "Auth",
  "BasicAuth",
  "BearerAuth",
  "Execute",
  "ExecuteRaw",
  "ExecuteUnit",
  "ExecuteUnitWithResponse",
  "ExecuteWithResponse",
  "HTTPError",
  "MultipartFormBody",
  "NewAPIClient",
  "NewMultipartFormBody",
  "QueryStyle",
  "QueryStyleForm",
  "QueryStylePipeDelimited",
  "QueryStyleSpaceDelimited",
  "RequestOptions",
  "URLEncoding",
  "Unexpected",
  "Wrap",
]);

export function buildRuntimeFiles(
  opts: RuntimeOpts,
  pkg: string,
): RuntimeFile[] {
  const names = opts.hasMultipart
    ? [...ALWAYS, "multipart_form_body.go"]
    : ALWAYS;
  return names.map((name) => ({
    name,
    content: readFileSync(new URL(name, RUNTIME_DIR), "utf8").replace(
      /^package api$/m,
      `package ${pkg}`,
    ),
  }));
}
