import { asyncapiToOpenAPI } from "../ir/asyncapi.js";
import { loadSpec } from "../spec/load/index.js";

/**
 * Load any input (file path, URL, .tsp file, pre-parsed object) and
 * return an OpenAPI document. An AsyncAPI document becomes one with no
 * paths whose component schemas are its message types.
 */
export async function loadOpenAPIForSdk(
  input: string,
): Promise<Record<string, unknown>> {
  const loaded = await loadSpec({ input });
  if (loaded.kind === "asyncapi") return asyncapiToOpenAPI(loaded.document);
  return loaded.document;
}
