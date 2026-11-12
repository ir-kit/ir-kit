/**
 * oRPC Generator Modules
 *
 * Each generator handles a specific responsibility in the code generation pipeline.
 */

export { generateClients } from "./client.js";
export { generateContracts } from "./contract.js";
export { generateFakerFactories } from "./faker.js";
export {
  generateHandlers,
  type HandlersGeneratorInput,
} from "./handlers/index.js";
export { generateRouter } from "./router.js";
export { generateServer } from "./server.js";
export { generateTanstack } from "./tanstack.js";
export type {
  ClientGeneratorInput,
  ClientTypeConfig,
  ContractGeneratorInput,
  ContractGeneratorOutput,
  GeneratorContext,
  RouterGeneratorInput,
  RouterGeneratorOutput,
  ServerGeneratorInput,
} from "./types.js";
