import type { OpenAPIV3_1 } from "@hey-api/spec-types";

import { mergeSchema } from "../infer/schema";
import type {
  ExampleBucket,
  OperationObservation,
  ResponseContent,
  Schema,
} from "../types";
import { describeStatus } from "./status";

/**
 * Accumulator for one OpenAPI operation, merged from multiple observations
 * that share `(origin, templated path, method)`. Holds path/query parameter
 * shapes, request and per-status response content (schemas + examples), and
 * detected auth schemes; converts to a fully-formed `OperationObject` on
 * demand.
 */
export class OperationBuilder {
  private pathParams: Record<string, "string" | "integer"> = {};
  private queryParams: Record<string, "string" | "integer" | "boolean"> = {};
  private requestContent = new Map<string, ResponseContent>();
  private responseContent = new Map<number, Map<string, ResponseContent>>();
  private authSchemes = new Set<string>();
  private exampleCap = Infinity;

  static fromObservation(
    obs: OperationObservation,
    pathParams: Record<string, "string" | "integer">,
    exampleCap = Infinity,
  ): OperationBuilder {
    const op = new OperationBuilder();
    op.pathParams = pathParams;
    op.queryParams = { ...obs.queryParams };
    op.requestContent = cloneContentMap(obs.requestContent);
    op.responseContent = new Map();
    for (const [status, byCt] of obs.responseContent) {
      op.responseContent.set(status, cloneContentMap(byCt));
    }
    op.authSchemes = new Set(obs.authSchemes);
    op.exampleCap = exampleCap;
    return op;
  }

  merge(other: OperationBuilder): this {
    Object.assign(this.pathParams, other.pathParams);
    Object.assign(this.queryParams, other.queryParams);
    mergeContentMap(this.requestContent, other.requestContent, this.exampleCap);
    for (const [status, byCt] of other.responseContent) {
      let existing = this.responseContent.get(status);
      if (!existing) {
        existing = new Map();
        this.responseContent.set(status, existing);
      }
      mergeContentMap(existing, byCt, this.exampleCap);
    }
    for (const id of other.authSchemes) this.authSchemes.add(id);
    return this;
  }

  toOpenApi(method: string): OpenAPIV3_1.OperationObject {
    const op: OpenAPIV3_1.OperationObject = {
      responses: this.buildResponses(),
    };
    const parameters = this.buildParameters();
    if (parameters.length > 0) op.parameters = parameters;

    const body = this.buildRequestBody(method);
    if (body) op.requestBody = body;

    if (this.authSchemes.size > 0) {
      op.security = [...this.authSchemes].map((id) => ({ [id]: [] }));
    }
    return op;
  }

  private buildParameters(): OpenAPIV3_1.ParameterObject[] {
    const out: OpenAPIV3_1.ParameterObject[] = [];
    for (const [name, type] of Object.entries(this.pathParams)) {
      out.push({
        name,
        in: "path",
        required: true,
        schema: { type },
      } as OpenAPIV3_1.ParameterObject);
    }
    for (const [name, type] of Object.entries(this.queryParams)) {
      out.push({
        name,
        in: "query",
        schema: { type },
      } as OpenAPIV3_1.ParameterObject);
    }
    return out;
  }

  /**
   * Emit the request body. PATCH bodies drop the top-level `required` array —
   * partial-update semantics mean fields aren't all required.
   */
  private buildRequestBody(
    method: string,
  ): OpenAPIV3_1.RequestBodyObject | undefined {
    if (this.requestContent.size === 0) return undefined;
    const content: Record<string, OpenAPIV3_1.MediaTypeObject> = {};
    for (const [ct, slot] of this.requestContent) {
      const media = buildMedia(slot, method === "patch");
      if (Object.keys(media).length > 0) content[ct] = media;
    }
    if (Object.keys(content).length === 0) return undefined;
    return { content };
  }

  private buildResponses(): Record<string, OpenAPIV3_1.ResponseObject> {
    const out: Record<string, OpenAPIV3_1.ResponseObject> = {};
    for (const [status, byCt] of this.responseContent) {
      const resp: OpenAPIV3_1.ResponseObject = {
        description: describeStatus(status),
      };
      const content: Record<string, OpenAPIV3_1.MediaTypeObject> = {};
      for (const [ct, slot] of byCt) {
        const media = buildMedia(slot, false);
        // Don't emit `content: { "application/json": {} }` — Scalar renders
        // that as a "No Body" tab which is just noise.
        if (Object.keys(media).length > 0) content[ct] = media;
      }
      if (Object.keys(content).length > 0) resp.content = content;
      out[String(status)] = resp;
    }
    if (Object.keys(out).length === 0) {
      out.default = { description: "Default response" };
    }
    return out;
  }
}

function buildMedia(
  slot: ResponseContent,
  patchSemantics: boolean,
): OpenAPIV3_1.MediaTypeObject {
  const media: OpenAPIV3_1.MediaTypeObject = {};
  if (slot.schema) {
    const schema = patchSemantics
      ? stripTopLevelRequired(slot.schema)
      : slot.schema;
    media.schema = schema as OpenAPIV3_1.SchemaObject;
  }
  attachExamples(media, slot.examples);
  return media;
}

function stripTopLevelRequired(s: Schema): Schema {
  if (s.type !== "object" || !("required" in s)) return s;
  const { required: _required, ...rest } = s as Schema & {
    required?: string[];
  };
  return rest as Schema;
}

/**
 * Attach captured examples to a media-type object. Uses the singular
 * `example` field for a single sample (cleaner Scalar rendering) and the
 * named-`examples` map for two or more.
 */
function attachExamples(
  media: OpenAPIV3_1.MediaTypeObject,
  bucket: ExampleBucket,
): void {
  if (bucket.size === 0) return;
  const values = [...bucket.values()];
  if (values.length === 1) {
    media.example = values[0];
    return;
  }
  const examples: Record<string, OpenAPIV3_1.ExampleObject> = {};
  values.forEach((value, i) => {
    examples[`example-${i + 1}`] = { value };
  });
  media.examples = examples;
}

function cloneContentMap(
  src: Map<string, ResponseContent>,
): Map<string, ResponseContent> {
  const out = new Map<string, ResponseContent>();
  for (const [ct, slot] of src) {
    out.set(ct, { schema: slot.schema, examples: new Map(slot.examples) });
  }
  return out;
}

function mergeContentMap(
  target: Map<string, ResponseContent>,
  source: Map<string, ResponseContent>,
  cap: number,
): void {
  for (const [ct, src] of source) {
    let slot = target.get(ct);
    if (!slot) {
      slot = { schema: null, examples: new Map() };
      target.set(ct, slot);
    }
    if (src.schema) {
      slot.schema = slot.schema
        ? mergeSchema(slot.schema, src.schema)
        : src.schema;
    }
    for (const [k, v] of src.examples) {
      if (slot.examples.size >= cap) break;
      if (!slot.examples.has(k)) slot.examples.set(k, v);
    }
  }
}
