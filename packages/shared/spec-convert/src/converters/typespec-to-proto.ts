import { compileTypespecCapture } from "@ir-kit/typespec-loader";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

registerConverter({
  from: "typespec",
  to: "proto",
  handler: async (document: SpecDocument, options): Promise<ConvertOutput> => {
    const path =
      typeof document.__path === "string" ? document.__path : undefined;
    const source =
      typeof document.__source === "string" ? document.__source : undefined;
    if (!path && !source) {
      throw new Error(
        "typespec→proto requires a `__path` or `__source` marker on the input document",
      );
    }
    const { files } = await compileTypespecCapture(
      path ? { path } : { source: source as string },
      {
        cwd: options.cwd,
        emitter: "@typespec/protobuf",
        emitterOptions: options.upstream,
      },
    );
    return { kind: "files", files };
  },
});
