import type {
  ConvertSpecInput,
  SpecDocument,
  SpecFormat,
} from "@ir-kit/spec-convert";

import { convertSpec } from "@ir-kit/spec-convert";
import { getHtmlDocument } from "@scalar/core/libs/html-rendering";

export type DocsTheme =
  | "default"
  | "alternate"
  | "moon"
  | "purple"
  | "solarized"
  | "bluePlanet"
  | "saturn"
  | "kepler"
  | "mars"
  | "deepSpace"
  | "none";

export interface RenderDocsOptions {
  input: ConvertSpecInput;
  from?: SpecFormat;
  cwd?: string;
  theme?: DocsTheme;
  /** Extra Scalar configuration merged into the HTML render. */
  scalar?: Record<string, unknown>;
}

export interface RenderDocsResult {
  html: string;
  openapi: SpecDocument;
  from: SpecFormat;
}

/**
 * Render any supported spec format as a standalone HTML page via
 * Scalar API Reference. Converts to OpenAPI 3 first (if needed), then
 * delegates HTML emission to `@scalar/core` — same renderer used by
 * the official Express/Hono/Fastify integrations.
 */
export async function renderDocs(
  opts: RenderDocsOptions,
): Promise<RenderDocsResult> {
  const result = await convertSpec({
    input: opts.input,
    from: opts.from,
    to: "openapi3",
    cwd: opts.cwd,
  });
  if (result.output.kind !== "document") {
    throw new Error(
      `Unexpected converter output kind '${result.output.kind}' for openapi3 target`,
    );
  }
  const openapi = result.output.document;
  const html = getHtmlDocument({
    content: openapi,
    ...(opts.theme ? { theme: opts.theme } : {}),
    ...opts.scalar,
  });
  return { html, openapi, from: result.from };
}
