import { loadOptional } from "../../../optional.js";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "postman",
  to: "openapi3",
  input: "file",
  handler: async (path: string): Promise<ConvertOutput> => {
    const { default: postmanToOpenAPI } = await loadOptional(
      () => import("@readme/postman-to-openapi"),
      "Converting from Postman",
      ["@readme/postman-to-openapi"],
    );
    const json = await postmanToOpenAPI(path, undefined, {
      defaultTag: "General",
      outputFormat: "json",
    });
    return {
      kind: "document",
      document: JSON.parse(json) as SpecDocument,
    };
  },
});
