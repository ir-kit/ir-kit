import { registerConverter } from "../registry.js";
import type { SpecDocument } from "../types.js";

registerConverter({
  from: "openapi3",
  to: "json-schema",
  handler: async (document: SpecDocument): Promise<SpecDocument> => {
    const components = (document.components ?? {}) as {
      schemas?: Record<string, unknown>;
    };
    return {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $defs: components.schemas ?? {},
    };
  },
});
