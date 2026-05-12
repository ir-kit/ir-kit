import { assembleDocument, type GroupSnapshot } from "./assemble";
import { type DetectedAuth, detectAuthScheme } from "./infer/auth";
import { sanitizeHeaders } from "./sanitize";
import { Store } from "./store";
import type { HttpMethod, ReconConfig, Sample } from "./types";

const HTTP_METHODS = new Set<HttpMethod>([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]);

const JSON_RE = /^application\/(.*\+)?json$/i;
/**
 * Text-like content-types we capture as raw string examples. Deliberately
 * narrow: `text/html`, `text/css`, `text/javascript`, `text/markdown` etc.
 * are page assets, NOT API payloads — including them dumps full HTML pages
 * into the spec as if they were endpoints.
 */
const TEXT_LIKE_RE =
  /^(text\/(plain|csv|x-yaml|yaml|tab-separated-values)|application\/(.*\+)?(yaml|xml|graphql|x-www-form-urlencoded)$)/i;
/** Content-types we explicitly drop — page documents, scripts, styles, fonts. */
const SKIP_RESPONSE_CONTENT_TYPES =
  /^(text\/(html|css|javascript|ecmascript|x-component)|application\/(javascript|ecmascript|x-javascript|xhtml\+xml)|font\/|image\/|video\/|audio\/)/i;

export interface ToOpenAPIOptions {
  /**
   * Restrict the output to a single observed origin (e.g. `https://api.example.com`).
   * Useful when traffic spans many origins and you want one spec per backend.
   */
  origin?: string;
}

export interface Recon {
  /**
   * Feed an observation. Accepts standard Web Fetch `Request` + `Response`.
   * Bodies must already be readable (call `.clone()` upstream if you also
   * need to forward the response). Non-JSON bodies are skipped silently.
   */
  observe(request: Request, response: Response): Promise<void>;
  /** Number of samples folded so far (across all groups). */
  sampleCount(): number;
  /** Per-origin sample counts, sorted by origin. */
  originStats(): ReadonlyMap<string, number>;
  /** Build the current OpenAPI 3.1 document from accumulated observations. */
  toOpenAPI(
    opts?: ToOpenAPIOptions,
  ): import("@hey-api/spec-types").OpenAPIV3_1.Document;
  /** Drop everything. */
  clear(): void;
  /** Drop observations for a single origin only. */
  clearOrigin(origin: string): void;
}

/** Create a new reconnaissance session. Pure — no global state. */
export function createRecon(config: ReconConfig = {}): Recon {
  const maxExamples = config.maxExamples ?? 3;
  const refDedupeThreshold = config.refDedupeThreshold ?? 2;
  const store = new Store(maxExamples);
  const detectedAuthSchemes = new Map<string, DetectedAuth | null>();
  const redact = config.redactHeaders;
  const title = config.title ?? "Reverse-engineered API";
  const version = config.version ?? "0.0.0";

  return {
    async observe(request, response) {
      const method = request.method.toLowerCase();
      if (!isHttpMethod(method)) return;

      const url = new URL(request.url);
      const rawRequestHeaders = headersToObject(request);
      const auth = detectAuthScheme(rawRequestHeaders);
      if (auth) detectedAuthSchemes.set(auth.id, auth);

      const requestHeaders = sanitizeHeaders(rawRequestHeaders, redact);
      const rawResponseHeaders = headersToObject(response);
      const responseCt = bareMediaType(rawResponseHeaders["content-type"]);
      if (responseCt && SKIP_RESPONSE_CONTENT_TYPES.test(responseCt)) return;
      const responseHeaders = sanitizeHeaders(rawResponseHeaders, redact);

      const requestRead = await readBody(request, requestHeaders);
      const responseRead = await readBody(response, responseHeaders);

      const sample: Sample = {
        method,
        origin: url.origin,
        pathname: url.pathname,
        query: queryToObject(url.searchParams),
        requestHeaders,
        requestContentType: requestRead.contentType,
        requestBody: requestRead.body,
        authSchemeId: auth?.id ?? null,
        status: response.status,
        responseHeaders,
        responseContentType: responseRead.contentType,
        responseBody: responseRead.body,
      };

      store.add(sample);
    },
    sampleCount() {
      return store.size();
    },
    originStats() {
      return store.originStats();
    },
    toOpenAPI(opts) {
      const snapshot = opts?.origin
        ? filterByOrigin(store.snapshot(), opts.origin)
        : store.snapshot();
      return assembleDocument(snapshot, {
        pathTemplating: config.pathTemplating ?? true,
        title,
        version,
        detectedAuthSchemes,
        refDedupeThreshold,
        maxExamples,
      });
    },
    clear() {
      store.clear();
      detectedAuthSchemes.clear();
    },
    clearOrigin(origin) {
      store.clearOrigin(origin);
    },
  };
}

function isHttpMethod(s: string): s is HttpMethod {
  return HTTP_METHODS.has(s as HttpMethod);
}

function filterByOrigin(
  snapshot: GroupSnapshot,
  origin: string,
): GroupSnapshot {
  const out = new Map<
    string,
    GroupSnapshot extends ReadonlyMap<string, infer V> ? V : never
  >();
  for (const [k, g] of snapshot) {
    if (g.origin === origin) out.set(k, g);
  }
  return out;
}

function headersToObject(r: Request | Response): Record<string, string> {
  const out: Record<string, string> = {};
  r.headers.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

function queryToObject(p: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  p.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

/**
 * Result of reading a request/response body. `contentType` is the bare media
 * type with any `;charset=...` params stripped (or `null` when no header).
 * `body` is parsed JSON for JSON content-types, a raw string for text-like
 * content (yaml/xml/plain/...), or `null` when the body wasn't readable
 * (binary, cached-empty, parse error, etc).
 */
interface ReadBody {
  contentType: string | null;
  body: unknown;
}

async function readBody(
  r: Request | Response,
  headers: Record<string, string>,
): Promise<ReadBody> {
  const contentType = bareMediaType(headers["content-type"]);
  if (!contentType) return { contentType: null, body: null };

  if (JSON_RE.test(contentType)) {
    try {
      return { contentType, body: await r.clone().json() };
    } catch {
      return { contentType, body: null };
    }
  }

  if (TEXT_LIKE_RE.test(contentType)) {
    try {
      const text = await r.clone().text();
      return { contentType, body: text.length > 0 ? text : null };
    } catch {
      return { contentType, body: null };
    }
  }

  // Known content-type, but body shape is binary / unsupported — keep the
  // type so the spec can still surface it, but we won't capture examples.
  return { contentType, body: null };
}

function bareMediaType(header: string | undefined): string | null {
  if (!header) return null;
  return header.split(";")[0].trim().toLowerCase() || null;
}
