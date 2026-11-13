import postmanToOpenAPI from "@readme/postman-to-openapi";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "postman",
  to: "openapi3",
  input: "file",
  handler: async (path: string): Promise<ConvertOutput> => {
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
