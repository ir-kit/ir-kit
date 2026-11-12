import { readFileSync } from "node:fs";

/**
 * Runtime helpers that ship into every generated SDK. They live as real,
 * ktlint-clean Kotlin sources in `packages/openapi/kotlin/runtime/` and
 * are copied verbatim; only the package header is rewritten.
 */
const RUNTIME_DIR = new URL("../../../runtime/", import.meta.url);

export interface RuntimeOpts {
  /** Ship the `multipart/form-data` helper. Set when at least one op has
   *  a `multipart/form-data` body. */
  hasMultipart: boolean;
}

export interface RuntimeFile {
  name: string;
  content: string;
}

const ALWAYS = [
  "APIClient.kt",
  "APIError.kt",
  "APIInterceptors.kt",
  "APIKeyLocation.kt",
  "Auth.kt",
  "QueryStyle.kt",
  "RequestOptions.kt",
  "URLEncoding.kt",
];

export function buildRuntimeFiles(
  opts: RuntimeOpts,
  pkg: string,
): RuntimeFile[] {
  const names = opts.hasMultipart
    ? [...ALWAYS, "MultipartFormBody.kt"]
    : ALWAYS;
  return names.map((name) => ({
    name,
    content: readFileSync(new URL(name, RUNTIME_DIR), "utf8").replace(
      /^package dev\.irkit\.runtime$/m,
      `package ${pkg}`,
    ),
  }));
}
