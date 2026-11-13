import { createRecon, type Recon } from "./recon.js";
import type { ReconConfig } from "./types.js";

/**
 * Minimal [HAR 1.2](https://w3c.github.io/web-performance/specs/HAR/Overview.html)
 * shape — just the fields `fromHAR` reads. Strict full-HAR is a superset of this.
 */
export interface HarFile {
  log: {
    entries: ReadonlyArray<HarEntry>;
  };
}

export interface HarEntry {
  request: HarRequest;
  response: HarResponse;
}

export interface HarRequest {
  method: string;
  url: string;
  headers: ReadonlyArray<HarHeader>;
  postData?: { text?: string; mimeType?: string };
}

export interface HarResponse {
  status: number;
  headers: ReadonlyArray<HarHeader>;
  content: { text?: string; mimeType?: string };
}

export interface HarHeader {
  name: string;
  value: string;
}

/**
 * Input for {@link fromHAR}. Strings are HAR JSON *content*, not file paths —
 * the package stays runtime-agnostic (works in browsers, Workers, Deno).
 * For Node file reading, pass `await readFile(path, "utf8")` yourself.
 */
export type HarSource = string | HarFile;

/**
 * Fold a HAR 1.2 source into a new {@link Recon} instance. Each entry becomes
 * a Web Fetch `Request` / `Response` pair, then runs through `observe()`.
 *
 * Entries that can't be turned into valid Fetch objects (bad URLs, illegal
 * header names) are skipped silently. HTTP/2 pseudo-headers (`:authority`,
 * `:method`, `:path`, `:scheme`) are dropped — Fetch rejects them. Bodies
 * on `GET`/`HEAD` are dropped — Fetch rejects them too.
 *
 * @example File-system path (Node)
 * ```ts
 * import { readFile } from "node:fs/promises";
 * const recon = await fromHAR(await readFile("./traffic.har", "utf8"));
 * const spec = recon.toOpenAPI();
 * ```
 *
 * @example Pre-parsed object (any runtime)
 * ```ts
 * const recon = await fromHAR(harJson, { title: "My API" });
 * ```
 */
export async function fromHAR(
  source: HarSource,
  config?: ReconConfig,
): Promise<Recon> {
  const har: HarFile =
    typeof source === "string" ? (JSON.parse(source) as HarFile) : source;
  const recon = createRecon(config);

  for (const entry of har.log?.entries ?? []) {
    const req = harRequestToFetch(entry.request);
    if (!req) continue;
    const res = harResponseToFetch(entry.response);
    if (!res) continue;
    await recon.observe(req, res);
  }

  return recon;
}

const METHODS_NO_BODY = new Set(["GET", "HEAD"]);

function harRequestToFetch(req: HarRequest): Request | null {
  try {
    const init: RequestInit = {
      method: req.method,
      headers: harHeadersToFetch(req.headers),
    };
    if (req.postData?.text && !METHODS_NO_BODY.has(req.method.toUpperCase())) {
      init.body = req.postData.text;
    }
    return new Request(req.url, init);
  } catch {
    return null;
  }
}

function harResponseToFetch(res: HarResponse): Response | null {
  try {
    return new Response(res.content?.text ?? "", {
      status: res.status,
      headers: harHeadersToFetch(res.headers),
    });
  } catch {
    return null;
  }
}

function harHeadersToFetch(headers: ReadonlyArray<HarHeader>): Headers {
  const h = new Headers();
  for (const { name, value } of headers) {
    // HTTP/2 pseudo-headers (`:authority`, `:method`, …) — Fetch's Headers rejects them.
    if (name.startsWith(":")) continue;
    try {
      h.append(name, value);
    } catch {
      // Other illegal header — skip silently rather than fail the whole entry.
    }
  }
  return h;
}
