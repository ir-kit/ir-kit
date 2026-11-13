import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "openapi3",
  to: "json-schema",
  handler: async (document: SpecDocument): Promise<ConvertOutput> => {
    const components = (document.components ?? {}) as {
      schemas?: Record<string, unknown>;
    };
    return {
      kind: "document",
      document: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $defs: components.schemas ?? {},
      },
    };
  },
});
