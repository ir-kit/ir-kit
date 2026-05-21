import { isAbsolute, resolve } from "node:path";
import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";
import { parseSpecOrThrow } from "@ir-kit/asyncapi-core";

export type AsyncAPIInput = string | AsyncAPIDocumentInterface;

export interface LoadAsyncAPIOptions {
  input: AsyncAPIInput;
  cwd?: string;
}

export async function loadAsyncAPI(
  opts: LoadAsyncAPIOptions,
): Promise<AsyncAPIDocumentInterface> {
  const input = opts.input;
  if (typeof input !== "string") return input;
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new Error("AsyncAPI spec input is empty or only whitespace.");
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return parseSpecOrThrow({ kind: "url", url: trimmed });
  }
  const cwd = opts.cwd ?? process.cwd();
  const path = isAbsolute(trimmed) ? trimmed : resolve(cwd, trimmed);
  return parseSpecOrThrow({ kind: "file", path });
}
