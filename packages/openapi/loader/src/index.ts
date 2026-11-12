import { isAbsolute, resolve } from "node:path";
import { $RefParser } from "@hey-api/json-schema-ref-parser";
import {
  hoistForeignSchemaRefs,
  type NormalizeOptions,
  normalizeSpec,
  SAFE_NORMALIZE,
} from "@ir-kit/openapi";

export type OpenAPIInput = string | Record<string, unknown>;

export interface LoadOpenAPIOptions {
  input: OpenAPIInput;
  cwd?: string;
  /** Apply hey-api-aware normalization after bundling. `true` enables
   *  the safe preset; pass an object for custom rules. */
  normalize?: boolean | NormalizeOptions;
}

export async function loadOpenAPI(
  opts: LoadOpenAPIOptions,
): Promise<Record<string, unknown>> {
  const parser = new $RefParser();
  const input = resolveOpenAPIInput(opts.input, opts.cwd);
  const { schema } = await parser.parse({ pathOrUrlOrSchema: input });
  const root = parser.$refs._root$Ref;
  detachExtensionRefs(schema);
  const bundled = (await parser.bundle({
    pathOrUrlOrSchema: input,
    resolvedInput: {
      path: root.path ?? "",
      schema,
      type:
        typeof input === "string" ? (root.pathType as "file" | "url") : "json",
    },
  })) as Record<string, unknown>;

  hoistForeignSchemaRefs(bundled);

  if (opts.normalize) {
    normalizeSpec(
      bundled,
      opts.normalize === true ? SAFE_NORMALIZE : opts.normalize,
    );
  }

  return bundled;
}

/** Keys whose children are user-named entries, never `x-` extensions. */
const NAMED_ENTRY_MAPS = new Set([
  "$defs",
  "callbacks",
  "content",
  "definitions",
  "encoding",
  "examples",
  "headers",
  "links",
  "mapping",
  "parameters",
  "pathItems",
  "patternProperties",
  "properties",
  "requestBodies",
  "responses",
  "schemas",
  "securitySchemes",
  "variables",
]);

/**
 * `x-` extensions are opaque to OpenAPI, so an external `$ref` inside one
 * (Spotify's `x-spotify-policy: { $ref: ../policies.yaml }`) is data, not a
 * dependency of the spec. Rename it to `x-$ref` so bundling never fetches it.
 */
export function detachExtensionRefs(node: unknown, inExtension = false): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) detachExtensionRefs(item, inExtension);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (
    inExtension &&
    typeof obj.$ref === "string" &&
    !obj.$ref.startsWith("#")
  ) {
    obj["x-$ref"] = obj.$ref;
    delete obj.$ref;
  }
  for (const [key, value] of Object.entries(obj)) {
    if (NAMED_ENTRY_MAPS.has(key) && value && typeof value === "object") {
      for (const entry of Object.values(value))
        detachExtensionRefs(entry, inExtension);
    } else {
      detachExtensionRefs(value, inExtension || key.startsWith("x-"));
    }
  }
}

export function resolveOpenAPIInput(
  input: OpenAPIInput,
  cwd: string = process.cwd(),
): OpenAPIInput {
  if (typeof input !== "string") return input;
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new Error("OpenAPI spec input is empty or only whitespace.");
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (isAbsolute(trimmed)) return trimmed;
  return resolve(cwd, trimmed);
}
