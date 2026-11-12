import { generateFactories } from "./generators/index.js";
import type { FakerPlugin } from "./types.js";

/**
 * Main faker plugin handler.
 * Generates faker factory functions from OpenAPI schemas.
 */
export const handler: FakerPlugin["Handler"] = ({ plugin }) => {
  // ============================================================================
  // File Paths Configuration
  // ============================================================================

  const outputFile = `${plugin.name}/${plugin.config.output}`;

  // ============================================================================
  // Factory Generation
  // ============================================================================

  generateFactories({
    plugin,
    outputFile,
  });
};
