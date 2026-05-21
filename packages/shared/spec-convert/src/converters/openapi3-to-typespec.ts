import { convertOpenAPI3Document } from "@typespec/openapi3";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "openapi3",
  to: "typespec",
  handler: async (document: SpecDocument): Promise<ConvertOutput> => {
    const source = await convertOpenAPI3Document(
      document as unknown as Parameters<typeof convertOpenAPI3Document>[0],
    );
    return { kind: "source", source, ext: "tsp" };
  },
});
