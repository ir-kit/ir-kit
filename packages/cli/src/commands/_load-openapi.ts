import { loadSpec } from "@ir-kit/spec-loader";

/**
 * Load any input (file path, URL, .tsp file, pre-parsed object) and
 * return an OpenAPI document. Throws when the detected kind is
 * incompatible with the calling SDK target.
 */
export async function loadOpenAPIForSdk(
  input: string,
): Promise<Record<string, unknown>> {
  const loaded = await loadSpec({ input });
  if (loaded.kind !== "openapi") {
    throw new Error(
      `SDK generation expects OpenAPI input; got ${loaded.kind}. ` +
        `Convert first with: ir spec convert <input> --to openapi3`,
    );
  }
  return loaded.document;
}
