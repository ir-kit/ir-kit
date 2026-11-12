import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";
import { openAPIToProto } from "./openapi3-to-proto/index.js";

registerConverter({
  from: "openapi3",
  to: "proto",
  handler: async (document: SpecDocument, options): Promise<ConvertOutput> => {
    const pkg = options.upstream?.package;
    const source = openAPIToProto(document, {
      package: typeof pkg === "string" ? pkg : undefined,
    });
    return { kind: "source", source, ext: "proto" };
  },
});
