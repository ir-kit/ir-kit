import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface RuntimeFile {
  name: string;
  content: string;
}

const RUNTIME_DIR = fileURLToPath(
  new URL("../../../runtime/", import.meta.url),
);

const FILES = [
  "ApiClient.java",
  "ApiException.java",
  "ApiInterceptors.java",
  "ApiKeyLocation.java",
  "ApiResult.java",
  "Auth.java",
  "QueryStyle.java",
  "RequestOptions.java",
  "UrlEncoding.java",
];

export function buildRuntimeFiles(
  opts: { hasMultipart: boolean },
  pkg: string,
): RuntimeFile[] {
  const names = opts.hasMultipart
    ? [...FILES, "MultipartFormBody.java"]
    : FILES;
  return names.map((name) => ({
    name,
    content: readFileSync(`${RUNTIME_DIR}${name}`, "utf8").replace(
      /^package [\w.]+;/m,
      `package ${pkg};`,
    ),
  }));
}
