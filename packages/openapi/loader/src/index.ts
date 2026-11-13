import { isAbsolute, resolve } from "node:path";
import {
  $RefParser,
  type JSONSchema,
  ParserError,
} from "@hey-api/json-schema-ref-parser";
import {
  hoistForeignSchemaRefs,
  type NormalizeOptions,
  normalizeSpec,
  SAFE_NORMALIZE,
} from "@ir-kit/openapi";
import { CORE_SCHEMA, load, type Type, types } from "js-yaml";

export type OpenAPIInput = string | Record<string, unknown>;

export interface LoadOpenAPIOptions {
  input: OpenAPIInput;
  cwd?: string;
  /** Apply hey-api-aware normalization after bundling. `true` enables
   *  the safe preset; pass an object for custom rules. */
  normalize?: boolean | NormalizeOptions;
}

/** Parse a spec file, URL or object into its raw root document without resolving refs. */
export async function readSpecDocument(
  input: OpenAPIInput,
  cwd?: string,
): Promise<Record<string, unknown>> {
  const { schema } = await createParser().parse({
    pathOrUrlOrSchema: resolveOpenAPIInput(input, cwd),
  });
  return schema as Record<string, unknown>;
}

export async function loadOpenAPI(
  opts: LoadOpenAPIOptions,
): Promise<Record<string, unknown>> {
  const parser = createParser();
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

declare module "js-yaml" {
  // why: exported at runtime but missing from @types/js-yaml.
  const types: { merge: Type };
}

// why: js-yaml's default YAML 1.1 schema turns unquoted dates such as
// Stripe's `api_version` enum (`- 2011-01-01`) into `Date` objects, which
// codegen then drops; the YAML 1.2 core schema keeps them as strings.
// `<<` merge keys stay supported, as specs use them to share fields.
const YAML_SCHEMA = CORE_SCHEMA.extend({ implicit: [types.merge] });

function createParser(): $RefParser {
  const parser = new $RefParser();
  parser.options.parse.yaml.handler = (file) => {
    const data = Buffer.isBuffer(file.data) ? file.data.toString() : file.data;
    if (typeof data !== "string") return data;
    try {
      return load(data, { schema: YAML_SCHEMA }) as JSONSchema;
    } catch (error) {
      throw new ParserError((error as Error).message, file.url);
    }
  };
  return parser;
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
