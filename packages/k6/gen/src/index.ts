export type { ClientEmitOptions } from "./emit/index.js";
export {
  emitClientFile,
  emitDataFile,
  emitIndexFile,
  emitTypesFile,
} from "./emit/index.js";
export type { BuiltFile, GenerateOptions, GenerateResult } from "./generate.js";
export { generate } from "./generate.js";

export type { WalkedOperation } from "./ir/index.js";
export { walkOperations } from "./ir/index.js";
