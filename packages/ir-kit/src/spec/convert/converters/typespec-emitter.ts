import { compileTypespecCapture } from "../../typespec/index.js";

import { registerConverter } from "../registry.js";
import type { ConvertOutput } from "../types.js";

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
    input: "file",
    handler: async (path: string, options): Promise<ConvertOutput> => {
      const { files } = await compileTypespecCapture(
        { path },
        { cwd: options.cwd, emitter, emitterOptions: options.upstream },
      );
      return { kind: "files", files };
    },
  });
}
