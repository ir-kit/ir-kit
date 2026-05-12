/**
 * Source for the page-scanning IIFE we hand to
 * `chrome.devtools.inspectedWindow.eval`. Kept as a separate `.ts` file so
 * the editor still type-checks it; we ship its body as a string at runtime.
 *
 * Returns a JSON-serialisable array of `{ url, hint }` so the panel can
 * render a list. The expression must be self-contained — `eval` runs in the
 * inspected page's world, with no closure capture.
 */
declare global {
  interface Window {
    location: Location;
  }
}

export interface ScannedDownload {
  url: string;
  /** Human-readable origin hint: `<a href>`, `[openapiurl]`, etc. */
  hint: string;
}

/**
 * The function is stringified by callers; it must reference only globals
 * available in the inspected page. No imports, no closures.
 */
export function scanPageForDownloads(): ScannedDownload[] {
  const out: ScannedDownload[] = [];
  const seen = new Set<string>();

  const push = (raw: string | null | undefined, hint: string) => {
    if (!raw) return;
    let url: string;
    try {
      url = new URL(raw, window.location.href).toString();
    } catch {
      return;
    }
    if (seen.has(url)) return;
    seen.add(url);
    out.push({ url, hint });
  };

  // Anchor hrefs ending in spec-like extensions.
  const SPEC_EXT = /\.(json|ya?ml)(\?|#|$)/i;
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && SPEC_EXT.test(href)) push(href, "<a href>");
  });

  // Common attributes that carry OpenAPI/AsyncAPI/Swagger spec URLs.
  const ATTR_NAMES = [
    "openapiurl",
    "openapi-url",
    "data-openapi-url",
    "data-openapi",
    "data-spec-url",
    "data-spec",
    "data-asyncapi",
    "data-asyncapi-url",
    "data-swagger-url",
    "spec-url",
    "url",
  ] as const;
  const selector = ATTR_NAMES.map((n) => `[${n}]`).join(",");
  document.querySelectorAll(selector).forEach((el) => {
    for (const name of ATTR_NAMES) {
      const v = el.getAttribute(name);
      if (v) push(v, `[${name}]`);
    }
  });

  // <link rel="..."> pointing at spec-like files.
  document.querySelectorAll("link[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && SPEC_EXT.test(href)) push(href, "<link href>");
  });

  return out;
}

/** Stringified scanner ready for `chrome.devtools.inspectedWindow.eval`. */
export const SCANNER_EXPRESSION = `(${scanPageForDownloads.toString()})()`;
