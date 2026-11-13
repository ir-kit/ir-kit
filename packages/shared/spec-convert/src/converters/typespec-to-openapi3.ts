import { compileTypespec } from "@ir-kit/typespec-loader";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "typespec",
  to: "openapi3",
  input: "file",
  handler: async (path: string, options): Promise<ConvertOutput> => {
    const { document } = await compileTypespec(
      { path },
      { cwd: options.cwd, openapi: options.upstream },
    );
    return { kind: "document", document: document as unknown as SpecDocument };
  },
});
