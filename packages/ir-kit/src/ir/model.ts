/**
 * ir-kit's model of an HTTP API, read by every native SDK target.
 * OpenAPI 2.0, 3.0 and 3.1 all lower into it (see `parseOpenAPI`).
 */

import type { Schema } from "../schema/types.js";

export type { Schema };

type Extensions = { [key: `x-${string}`]: unknown };

export interface Model {
  components?: Components;
  paths?: Paths;
  servers?: ReadonlyArray<Server>;
}

export interface Components {
  parameters?: Record<string, Parameter>;
  requestBodies?: Record<string, RequestBody>;
  schemas?: Record<string, Schema>;
}

export interface Server {
  url: string;
  description?: string;
  variables?: Record<
    string,
    { default: string; enum?: string[]; description?: string }
  >;
}

export interface Paths {
  [path: `/${string}`]: PathItem;
}

export type Method =
  | "delete"
  | "get"
  | "head"
  | "options"
  | "patch"
  | "post"
  | "put"
  | "trace";

export type PathItem = { [M in Method]?: Operation };

export interface Operation extends Extensions {
  id: string;
  method: Method;
  path: keyof Paths;
  operationId?: string;
  summary?: string;
  description?: string;
  deprecated?: boolean;
  tags?: ReadonlyArray<string>;
  parameters?: Parameters;
  body?: Body;
  responses?: Responses;
  /**
   * Names of the security schemes this operation accepts, from its own
   * `security` or the document's. Empty when it needs no auth.
   */
  securitySchemes: ReadonlyArray<string>;
}

export interface Parameters {
  cookie?: Record<string, Parameter>;
  header?: Record<string, Parameter>;
  path?: Record<string, Parameter>;
  query?: Record<string, Parameter>;
}

export interface Parameter extends Extensions {
  name: string;
  location: "cookie" | "header" | "path" | "query";
  schema: Schema;
  required?: boolean;
  deprecated?: boolean;
  description?: string;
  explode: boolean;
  allowReserved?: boolean;
  style:
    | "deepObject"
    | "form"
    | "label"
    | "matrix"
    | "pipeDelimited"
    | "simple"
    | "spaceDelimited";
  pagination?: boolean | string;
}

export type MediaType =
  | "form-data"
  | "json"
  | "octet-stream"
  | "text"
  | "url-search-params";

export interface Body {
  mediaType: string;
  type?: MediaType;
  schema: Schema;
  required?: boolean;
  pagination?: boolean | string;
}

export interface RequestBody {
  schema: Schema;
  required?: boolean;
  description?: string;
}

export interface Responses {
  [statusCode: string]: Response | undefined;
  default?: Response;
}

export interface Response {
  mediaType?: string;
  schema: Schema;
}
