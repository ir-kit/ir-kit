import { GENERATED_HEADER } from "../print.js";

export type { ClientEmitOptions } from "./client.js";
export { emitClientFile } from "./client.js";
export { emitDataFile } from "./data.js";
export { emitTypesFile } from "./types.js";

/** Emit the umbrella `index.ts` re-exporting client, types, data. */
export function emitIndexFile(): string {
  return `${GENERATED_HEADER}
export * from "./client.js";
export * as types from "./types.js";
export { data } from "./data.js";
`;
}
