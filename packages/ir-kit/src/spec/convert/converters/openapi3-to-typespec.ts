import { loadOptional } from "../../../optional.js";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "openapi3",
  to: "typespec",
  handler: async (document: SpecDocument): Promise<ConvertOutput> => {
    const { convertOpenAPI3Document } = await loadOptional(
      () => import("@typespec/openapi3"),
      "Converting to TypeSpec",
      ["@typespec/compiler", "@typespec/openapi3"],
    );
    const source = await convertOpenAPI3Document(
      document as unknown as Parameters<typeof convertOpenAPI3Document>[0],
    );
    return { kind: "source", source, ext: "tsp" };
  },
});
