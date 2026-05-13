/**
 * Stringified and handed to `chrome.devtools.inspectedWindow.eval`, so the
 * function body must be self-contained — no imports, no closures, only
 * globals available in the inspected page.
 */
declare global {
  interface Window {
    location: Location;
  }
}

export interface ScannedDownload {
  url: string;
  hint: string;
}

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

  const SPEC_EXT = /\.(json|ya?ml)(\?|#|$)/i;
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && SPEC_EXT.test(href)) push(href, "<a href>");
  });

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

  document.querySelectorAll("link[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && SPEC_EXT.test(href)) push(href, "<link href>");
  });

  return out;
}

export const SCANNER_EXPRESSION = `(${scanPageForDownloads.toString()})()`;
