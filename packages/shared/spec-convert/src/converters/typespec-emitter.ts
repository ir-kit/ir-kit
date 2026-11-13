import { compileTypespecCapture } from "@ir-kit/typespec-loader";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

type Registration = Parameters<typeof registerConverter>[0];

/** Register a `typespec → to` converter that runs a TypeSpec emitter and returns the files it writes. */
export function registerTypespecEmitter(
  to: Registration["to"],
  emitter: string,
  extra: Pick<Registration, "authoredInputOnly"> = {},
): void {
  registerConverter({
    from: "typespec",
    to,
    ...extra,
    handler: async (
      document: SpecDocument,
      options,
    ): Promise<ConvertOutput> => {
      const path =
        typeof document.__path === "string" ? document.__path : undefined;
      const source =
        typeof document.__source === "string" ? document.__source : undefined;
      if (!path && !source) {
        throw new Error(
          `typespec→${to} requires a \`__path\` or \`__source\` marker on the input document`,
        );
      }
      const { files } = await compileTypespecCapture(
        path ? { path } : { source: source as string },
        { cwd: options.cwd, emitter, emitterOptions: options.upstream },
      );
      return { kind: "files", files };
    },
  });
}
