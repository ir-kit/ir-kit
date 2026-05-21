import Converter from "openapi-to-postmanv2";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

interface ConvertResult {
  result: boolean;
  reason?: string;
  output?: Array<{ type: string; data: SpecDocument }>;
}

registerConverter({
  from: "openapi3",
  to: "postman",
  handler: async (document: SpecDocument): Promise<ConvertOutput> => {
    const json = JSON.stringify(document);
    const result = await new Promise<ConvertResult>((resolve, reject) => {
      Converter.convert(
        { type: "string", data: json },
        { folderStrategy: "Tags" },
        (err, res) => {
          if (err) reject(new Error(err.message));
          else resolve(res as ConvertResult);
        },
      );
    });
    if (!result.result || !result.output?.[0]?.data) {
      throw new Error(
        `openapi3→postman failed: ${result.reason ?? "no output produced"}`,
      );
    }
    return { kind: "document", document: result.output[0].data };
  },
});
