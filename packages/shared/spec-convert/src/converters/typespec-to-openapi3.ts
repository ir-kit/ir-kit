import { compileTypespec } from "@ir-kit/typespec-loader";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "typespec",
  to: "openapi3",
  handler: async (document: SpecDocument, options): Promise<ConvertOutput> => {
    const path =
      typeof document.__path === "string" ? document.__path : undefined;
    const source =
      typeof document.__source === "string" ? document.__source : undefined;

    if (path) {
      const { document: out } = await compileTypespec(
        { path },
        { cwd: options.cwd, openapi: options.upstream },
      );
      return { kind: "document", document: out as unknown as SpecDocument };
    }
    if (source) {
      const { document: out } = await compileTypespec(
        { source },
        { cwd: options.cwd, openapi: options.upstream },
      );
      return { kind: "document", document: out as unknown as SpecDocument };
    }
    throw new Error(
      "typespec→openapi3 requires a `__path` or `__source` marker on the input document",
    );
  },
});
