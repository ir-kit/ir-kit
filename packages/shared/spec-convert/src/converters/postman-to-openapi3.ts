import postmanToOpenAPI from "@readme/postman-to-openapi";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "postman",
  to: "openapi3",
  handler: async (document: SpecDocument): Promise<ConvertOutput> => {
    const path =
      typeof document.__path === "string" ? document.__path : undefined;
    if (!path) {
      throw new Error(
        "postman→openapi3 requires a file path; pass the collection path as input",
      );
    }
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
